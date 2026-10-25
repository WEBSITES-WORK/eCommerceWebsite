const fs = require('fs');
const path = require('path');

const seedDataContent = fs.readFileSync(path.join(__dirname, '../backend/src/utils/seedData.js'), 'utf8');

// Helper to escape SQL strings
const escapeSql = (str) => {
  if (str === null || str === undefined) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
};

// 1. Categories
const catMatch = seedDataContent.match(/const categoriesData = (\[[\s\S]*?\]);\s*const categories/);
const categoriesData = eval(catMatch[1]);

const categoryMap = {
  'electronics': 'c0000000-0000-0000-0000-000000000001',
  'fashion': 'c0000000-0000-0000-0000-000000000002',
  'home-living': 'c0000000-0000-0000-0000-000000000003',
  'beauty': 'c0000000-0000-0000-0000-000000000004',
  'sports': 'c0000000-0000-0000-0000-000000000005',
  'laptops-workspace': 'c0000000-0000-0000-0000-000000000006',
};

// 2. Brands
const brandMatch = seedDataContent.match(/const brandsData = (\[[\s\S]*?\]);\s*const brands/);
const brandsData = eval(brandMatch[1]);

const brandMap = {
  'sony': 'b0000000-0000-0000-0000-000000000001',
  'apple': 'b0000000-0000-0000-0000-000000000002',
  'nike': 'b0000000-0000-0000-0000-000000000003',
  'samsung': 'b0000000-0000-0000-0000-000000000004',
  'dyson': 'b0000000-0000-0000-0000-000000000005',
  'logitech': 'b0000000-0000-0000-0000-000000000006',
  'adidas': 'b0000000-0000-0000-0000-000000000007',
};

// 3. Products
const prodMatch = seedDataContent.match(/const productsData = (\[[\s\S]*?\]);\s*const products = await/);
let prodRaw = prodMatch[1]
  .replace(/catMap\['([^']+)'\]/g, '"$1"')
  .replace(/brandMap\['([^']+)'\]/g, '"$1"');
const productsData = eval(prodRaw);

// Assign fixed UUIDs to products
const productUuidMap = {};
productsData.forEach((p, index) => {
  const num = (index + 1).toString().padStart(4, '0');
  productUuidMap[p.slug] = `p0000000-0000-0000-0000-00000000${num}`;
});

// 4. Coupons
const couponMatch = seedDataContent.match(/const couponsData = (\[[\s\S]*?\]);\s*const coupons/);
const couponsData = eval(couponMatch[1]);

// Build SQL
let sql = `-- ============================================================================
-- NOVASHOP: PRODUCTION SUPABASE SEED DATA (PRODUCTS, USERS, BRANDS, CATEGORIES)
-- ============================================================================
-- Execute this script in the Supabase Dashboard -> SQL Editor.
-- It populates:
--   1. Categories (6)
--   2. Brands (7)
--   3. Authenticated Users & Profiles (1 Admin, 3 Customers)
--   4. Products (22 Flagship Products with images, variants, specifications)
--   5. Promotional Coupons (6 Active Coupons)
--   6. Customer Delivery Addresses
--   7. Verified Product Reviews
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CATEGORIES
-- ============================================================================
INSERT INTO public.categories (id, name, slug, description, image, is_active)
VALUES
`;

sql += categoriesData.map(c => {
  const id = categoryMap[c.slug];
  return `  ('${id}', ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.image)}, true)`;
}).join(',\n');

sql += `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- 2. BRANDS
-- ============================================================================
INSERT INTO public.brands (id, name, slug, description, logo, is_active)
VALUES
`;

sql += brandsData.map(b => {
  const id = brandMap[b.slug];
  return `  ('${id}', ${escapeSql(b.name)}, ${escapeSql(b.slug)}, ${escapeSql(b.description)}, ${escapeSql(b.logo)}, true)`;
}).join(',\n');

sql += `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  logo = EXCLUDED.logo,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- 3. USERS (AUTH.USERS & PUBLIC.PROFILES)
-- ============================================================================
-- Seed 1 Admin & 3 Customers with email_confirmed_at set so login works immediately.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@ecommerce.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Admin Director","role":"admin","phone":"+1 555-0100"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'customer@ecommerce.com',
  crypt('Customer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Sarah Connor","role":"customer","phone":"+1 555-0145"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'alex.rivers@ecommerce.com',
  crypt('Customer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Alex Rivers","role":"customer","phone":"+1 555-0178"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'elena.rostova@ecommerce.com',
  crypt('Customer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Elena Rostova","role":"customer","phone":"+1 555-0192"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  email_confirmed_at = NOW();

-- Synchronize Public Profiles with correct user roles:
INSERT INTO public.profiles (id, email, name, role, phone, avatar)
VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'admin@ecommerce.com',
  'Admin Director',
  'admin'::user_role,
  '+1 555-0100',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
),
(
  'd0000000-0000-0000-0000-000000000001',
  'customer@ecommerce.com',
  'Sarah Connor',
  'customer'::user_role,
  '+1 555-0145',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
),
(
  'd0000000-0000-0000-0000-000000000002',
  'alex.rivers@ecommerce.com',
  'Alex Rivers',
  'customer'::user_role,
  '+1 555-0178',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
),
(
  'd0000000-0000-0000-0000-000000000003',
  'elena.rostova@ecommerce.com',
  'Elena Rostova',
  'customer'::user_role,
  '+1 555-0192',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  avatar = EXCLUDED.avatar;

-- ============================================================================
-- 4. PRODUCTS (22 DETAILED PRODUCTS)
-- ============================================================================
INSERT INTO public.products (
  id,
  title,
  slug,
  description,
  price,
  discount_price,
  category_id,
  brand_id,
  sku,
  stock,
  low_stock_threshold,
  rating,
  reviews_count,
  images,
  variants,
  specifications,
  is_active,
  is_featured
)
VALUES
`;

sql += productsData.map((p, index) => {
  const id = productUuidMap[p.slug];
  const catId = categoryMap[p.category] || null;
  const brId = brandMap[p.brand] || null;
  const imagesArray = 'ARRAY[' + (p.images || []).map(img => escapeSql(img)).join(', ') + ']::TEXT[]';
  const variantsJson = escapeSql(JSON.stringify(p.variants || [])) + '::JSONB';
  const specsJson = escapeSql(JSON.stringify(p.specifications || [])) + '::JSONB';
  const rating = 4.8;
  const reviewsCount = 12 + index * 3;

  return `(
  '${id}',
  ${escapeSql(p.title)},
  ${escapeSql(p.slug)},
  ${escapeSql(p.description)},
  ${p.price.toFixed(2)},
  ${(p.discountPrice || 0).toFixed(2)},
  '${catId}',
  '${brId}',
  ${escapeSql(p.sku)},
  ${p.stock || 20},
  ${p.lowStockThreshold || 5},
  ${rating},
  ${reviewsCount},
  ${imagesArray},
  ${variantsJson},
  ${specsJson},
  true,
  ${p.isFeatured ? 'true' : 'false'}
)`;
}).join(',\n');

sql += `
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  category_id = EXCLUDED.category_id,
  brand_id = EXCLUDED.brand_id,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  images = EXCLUDED.images,
  variants = EXCLUDED.variants,
  specifications = EXCLUDED.specifications,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured;

-- ============================================================================
-- 5. PROMOTIONAL COUPONS
-- ============================================================================
INSERT INTO public.coupons (
  code,
  discount_type,
  discount_amount,
  min_order_amount,
  max_discount_amount,
  usage_limit,
  used_count,
  is_active,
  expires_at
)
VALUES
`;

sql += couponsData.map(c => {
  return `(
  ${escapeSql(c.code)},
  ${escapeSql(c.discountType)},
  ${c.discountAmount.toFixed(2)},
  ${c.minOrderAmount.toFixed(2)},
  ${c.maxDiscountAmount ? c.maxDiscountAmount.toFixed(2) : 'NULL'},
  ${c.usageLimit || 'NULL'},
  ${c.usedCount || 0},
  true,
  NOW() + INTERVAL '180 days'
)`;
}).join(',\n');

sql += `
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_amount = EXCLUDED.discount_amount,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount_amount = EXCLUDED.max_discount_amount,
  is_active = true;

-- ============================================================================
-- 6. CUSTOMER ADDRESSES
-- ============================================================================
INSERT INTO public.addresses (
  id,
  user_id,
  full_name,
  phone,
  street_address,
  apartment,
  city,
  state,
  postal_code,
  country,
  address_type,
  is_default
)
VALUES
(
  'ad000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Sarah Connor',
  '+1 555-0145',
  '742 Evergreen Terrace',
  'Apt 4B',
  'Springfield',
  'Oregon',
  '97477',
  'United States',
  'Home',
  true
),
(
  'ad000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  'Alex Rivers',
  '+1 555-0178',
  '450 Mission Street',
  'Suite 1200',
  'San Francisco',
  'California',
  '94105',
  'United States',
  'Office',
  true
)
ON CONFLICT (id) DO UPDATE SET
  street_address = EXCLUDED.street_address,
  apartment = EXCLUDED.apartment,
  city = EXCLUDED.city,
  state = EXCLUDED.state;

-- ============================================================================
-- 7. VERIFIED REVIEWS
-- ============================================================================
INSERT INTO public.reviews (
  product_id,
  user_id,
  rating,
  title,
  comment,
  is_approved,
  is_verified_purchase
)
VALUES
(
  '${productUuidMap['sony-wh-1000xm5-wireless-headphones']}',
  'd0000000-0000-0000-0000-000000000001',
  5,
  'Unbelievable noise cancelling and rich audio clarity',
  'I travel weekly on cross-country flights and these headphones completely erase airplane cabin roar. The earcups are super comfortable for 8-hour sessions.',
  true,
  true
),
(
  '${productUuidMap['sony-wh-1000xm5-wireless-headphones']}',
  'd0000000-0000-0000-0000-000000000002',
  5,
  'Top-tier microphones for zoom calls',
  'Clear sound reproduction and the microphone filter isolates background noise brilliantly. Multipoint bluetooth connects to my phone and laptop at the same time.',
  true,
  true
),
(
  '${productUuidMap['apple-watch-series-9-gps-45mm']}',
  'd0000000-0000-0000-0000-000000000001',
  5,
  'Double tap gesture is genuinely revolutionary',
  'Answering phone calls and dismissing timers with one hand while holding coffee is effortless. Battery easily lasts all day with workout tracking.',
  true,
  true
),
(
  '${productUuidMap['nike-air-max-270-react-flyknit']}',
  'd0000000-0000-0000-0000-000000000002',
  4,
  'Very comfortable daily sneakers with great bounce',
  'The heel air unit provides great shock absorption. Sizing runs true to size. Looks sharp with jeans or running shorts.',
  true,
  true
),
(
  '${productUuidMap['apple-macbook-pro-16-m3-max']}',
  'd0000000-0000-0000-0000-000000000003',
  5,
  'Unrivaled computational power and battery endurance',
  'Renders 8K video timelines seamlessly without the fans even kicking on. The XDR display has deep blacks and vibrant contrast. Best workstation on the market.',
  true,
  true
),
(
  '${productUuidMap['logitech-mx-master-3s-performance-mouse']}',
  'd0000000-0000-0000-0000-000000000001',
  5,
  'The gold standard for spreadsheet and coding productivity',
  'The silent clicks are satisfying and the magnetic scroll wheel is addictive. Seamlessly flows between my Mac and PC workstation.',
  true,
  true
);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'NovaShop Supabase database successfully seeded with 6 categories, 7 brands, 4 users/profiles, 22 products, 6 coupons, 2 addresses, and 6 reviews.';
END $$;
`;

fs.writeFileSync(path.join(__dirname, '../supabase/seed.sql'), sql, 'utf8');
console.log('Successfully generated supabase/seed.sql!');
