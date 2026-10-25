-- ============================================================================
-- NOVASHOP E-COMMERCE: PRODUCTION SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & HELPERS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. PROFILES TABLE (Linked directly to Supabase Auth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  role user_role DEFAULT 'customer'::user_role NOT NULL,
  is_blocked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for instant role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: check if currently authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'::user_role
      AND is_blocked = false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger: Automatically sync user profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS Policies:
-- Customers can view their own profile; Admins can view all profiles
CREATE POLICY "Profiles are viewable by owner or admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Customers can update only their own profile (cannot escalate their own role)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

-- Admins can update any profile (including role changes and block status)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ============================================================================
-- 4. CATEGORIES & BRANDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin write categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read brands"
  ON public.brands FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin write brands"
  ON public.brands FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 5. PRODUCTS & INVENTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(10, 2) DEFAULT 0 CHECK (discount_price >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  sku TEXT UNIQUE NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
  low_stock_threshold INTEGER DEFAULT 5 NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 0 NOT NULL,
  reviews_count INTEGER DEFAULT 0 NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  variants JSONB DEFAULT '[]'::JSONB NOT NULL,
  specifications JSONB DEFAULT '[]'::JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can view active products; Admins can view all products
CREATE POLICY "Public read active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Only Admins can create, update, or delete products
CREATE POLICY "Admins full manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 6. CUSTOMER ADDRESSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  apartment TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'United States' NOT NULL,
  address_type TEXT DEFAULT 'Home' NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- 7. ORDERS & ORDER ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_price NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  tax_price NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  order_status TEXT DEFAULT 'Processing' NOT NULL,
  payment_method TEXT DEFAULT 'COD' NOT NULL,
  payment_status TEXT DEFAULT 'Pending' NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number TEXT DEFAULT '',
  carrier TEXT DEFAULT '',
  coupon_code TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view only their own orders; Admins can view all orders
CREATE POLICY "Users view own orders or admin"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Customers can create their own order
CREATE POLICY "Users create own order"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update order status, courier info, tracking
CREATE POLICY "Admins update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  image TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  sku TEXT NOT NULL,
  selected_variant JSONB DEFAULT '{}'::JSONB NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = public.order_items.order_id
        AND (user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = public.order_items.order_id
        AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. CART & WISHLIST
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  selected_variant JSONB DEFAULT '{}'::JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wishlist"
  ON public.wishlist_items FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 9. REVIEWS & COUPONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT DEFAULT '',
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins moderate reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_amount NUMERIC(10, 2) NOT NULL CHECK (discount_amount > 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  max_discount_amount NUMERIC(10, 2) DEFAULT NULL,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public validate active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 10. SUPABASE STORAGE: PRODUCT IMAGES BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());
