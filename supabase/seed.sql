-- ============================================================================
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
  ('c0000000-0000-0000-0000-000000000001', 'Electronics & Audio', 'electronics', 'Cutting-edge gadgets, flagship smartphones, noise-cancelling headphones, and computing gear.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', true),
  ('c0000000-0000-0000-0000-000000000002', 'Fashion & Apparel', 'fashion', 'Contemporary streetwear, performance footwear, athleisure, and premium lifestyle accessories.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80', true),
  ('c0000000-0000-0000-0000-000000000003', 'Home & Living', 'home-living', 'Modern ergonomic office furniture, artisan dinnerware, ambient lighting, and decor.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80', true),
  ('c0000000-0000-0000-0000-000000000004', 'Beauty & Wellness', 'beauty', 'Intelligent haircare appliances, advanced skincare routines, and personal wellness essentials.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80', true),
  ('c0000000-0000-0000-0000-000000000005', 'Fitness & Sports', 'sports', 'High-performance gym gear, training apparatus, running shoes, and outdoor gear.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80', true),
  ('c0000000-0000-0000-0000-000000000006', 'Laptops & Workspaces', 'laptops-workspace', 'Productivity laptops, high-speed monitors, mechanical keyboards, and precision peripherals.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', true)
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
  ('b0000000-0000-0000-0000-000000000001', 'Sony', 'sony', 'World pioneer in consumer electronics, high-resolution audio, and visual innovations.', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80', true),
  ('b0000000-0000-0000-0000-000000000002', 'Apple', 'apple', 'Visionary consumer technology including iPhone, Apple Watch, and MacBook computers.', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80', true),
  ('b0000000-0000-0000-0000-000000000003', 'Nike', 'nike', 'World-renowned athletic footwear, apparel, sports equipment, and running innovations.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80', true),
  ('b0000000-0000-0000-0000-000000000004', 'Samsung', 'samsung', 'Global leader in mobile communications, OLED displays, and smart appliances.', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&auto=format&fit=crop&q=80', true),
  ('b0000000-0000-0000-0000-000000000005', 'Dyson', 'dyson', 'Groundbreaking air science engineering, supersonic hair dryers, and vacuum appliances.', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&auto=format&fit=crop&q=80', true),
  ('b0000000-0000-0000-0000-000000000006', 'Logitech', 'logitech', 'Precision ergonomic mice, mechanical gaming keyboards, and streaming peripherals.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=200&auto=format&fit=crop&q=80', true),
  ('b0000000-0000-0000-0000-000000000007', 'Adidas', 'adidas', 'Pioneering performance sportswear, Boost cushioning, and classic street sneakers.', 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&auto=format&fit=crop&q=80', true)
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
(
  'p0000000-0000-0000-0000-000000000001',
  'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
  'sony-wh-1000xm5-wireless-headphones',
  'Industry-leading active noise canceling with two processors and eight microphones. Exceptional sound quality engineered to perfection with High-Resolution Audio support and crystal-clear hands-free calling.',
  399.99,
  348.00,
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'SONY-WH1000XM5-BLK',
  35,
  5,
  4.8,
  12,
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Midnight Black","Platinum Silver","Navy Blue"]}]'::JSONB,
  '[{"key":"Battery Life","value":"30 Hours (ANC On)"},{"key":"Connectivity","value":"Bluetooth 5.2, 3.5mm AUX"},{"key":"Weight","value":"250 grams"},{"key":"Noise Cancellation","value":"Dual Processor QN1 + V1"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000002',
  'Apple Watch Series 9 GPS 45mm Aluminum Case',
  'apple-watch-series-9-gps-45mm',
  'Smarter, brighter, and mightier. Powered by the S9 SiP with Double Tap gesture control, a magically bright 2000-nit Always-On display, and precision iPhone finding.',
  429.00,
  379.00,
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'APL-W9-45M',
  22,
  4,
  4.8,
  15,
  ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Midnight","Starlight","Silver"]},{"name":"Band Size","options":["S/M","M/L"]}]'::JSONB,
  '[{"key":"Display","value":"Always-On Retina OLED (2000 nits)"},{"key":"Processor","value":"Apple S9 SiP"},{"key":"Water Resistance","value":"50m Swimproof"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000003',
  'Nike Air Max 270 React Flyknit Sneakers',
  'nike-air-max-270-react-flyknit',
  'Nike''s biggest heel Air unit yet delivers ultra-soft cushioning that feels as impossible as it looks. The lightweight Flyknit upper hugs your foot for an effortless run or casual daily wear.',
  160.00,
  129.99,
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'NIKE-AM270-RED',
  45,
  8,
  4.8,
  18,
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Size","options":["US 8","US 9","US 10","US 11","US 12"]},{"name":"Color","options":["University Red","Triple Black","Pure White"]}]'::JSONB,
  '[{"key":"Cushioning","value":"React Foam + Max Air 270 Heel Unit"},{"key":"Upper Material","value":"Breathable Flyknit Fabric"},{"key":"Gender","value":"Unisex"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000004',
  'Samsung Galaxy S24 Ultra 5G (512GB Titanium)',
  'samsung-galaxy-s24-ultra-5g-512gb',
  'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Integrated S Pen, 200MP camera system, and Galaxy AI built right in.',
  1399.00,
  1249.00,
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000004',
  'SAM-S24U-512',
  14,
  3,
  4.8,
  21,
  ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Titanium Gray","Titanium Black","Titanium Violet"]}]'::JSONB,
  '[{"key":"Processor","value":"Snapdragon 8 Gen 3 for Galaxy"},{"key":"Storage","value":"512GB UFS 4.0"},{"key":"Main Camera","value":"200 MP Quad Telephoto"},{"key":"Battery","value":"5,000 mAh Fast Charging"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000005',
  'Dyson Supersonic™ Intelligent Hair Dryer',
  'dyson-supersonic-intelligent-hair-dryer',
  'Engineered for different hair types, fast drying with no extreme heat. Powered by the small, powerful Dyson digital motor V9 combined with Air Multiplier™ technology.',
  429.99,
  399.00,
  'c0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000005',
  'DYS-SUPER-V2',
  18,
  4,
  4.8,
  24,
  ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Iron / Fuchsia","Copper / Nickel","Prussian Blue"]}]'::JSONB,
  '[{"key":"Motor","value":"Dyson V9 digital motor"},{"key":"Heat Settings","value":"4 precise heat settings"},{"key":"Attachments","value":"Flyaway attachment, Styling concentrator"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000006',
  'Ergonomic Mesh Executive Desk Chair',
  'ergonomic-mesh-executive-desk-chair',
  'High back breathable mesh chair with 3D adjustable armrests, dynamic lumbar support, and smooth multi-angle reclining mechanism for all-day posture comfort.',
  289.00,
  229.00,
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000006',
  'HOME-CHAIR-ERG',
  16,
  5,
  4.8,
  27,
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Space Gray","Onyx Black"]}]'::JSONB,
  '[{"key":"Max Weight Capacity","value":"300 lbs"},{"key":"Material","value":"High-density breathable Korean mesh"},{"key":"Warranty","value":"5 Years"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000007',
  'Pro Aerobic High-Tension Resistance Bands Kit',
  'pro-aerobic-resistance-bands-kit',
  'Set of 5 stackable resistance tubes ranging from 10 to 50 lbs (up to 150 lbs combined) with door anchor, cushioned handles, and ankle straps.',
  49.99,
  34.99,
  'c0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000003',
  'SPT-BAND-SET',
  60,
  10,
  4.8,
  30,
  ARRAY['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[]'::JSONB,
  '[{"key":"Material","value":"100% Natural Malaysian Latex"},{"key":"Tension Range","value":"10 lbs to 150 lbs combined"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000008',
  'Minimalist Matte Ceramic Dinnerware Set (16-Piece)',
  'minimalist-matte-ceramic-dinnerware-set',
  'Service for 4 crafted from durable stoneware with modern organic rims and a scratch-resistant satin matte finish. Microwave and dishwasher safe.',
  139.00,
  109.00,
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  'KIT-CER-16P',
  28,
  5,
  4.8,
  33,
  ARRAY['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Finish","options":["Matte Charcoal","Sand Dune Beige","Sage Green"]}]'::JSONB,
  '[{"key":"Pieces","value":"4 Dinner plates, 4 Salad plates, 4 Bowls, 4 Mugs"},{"key":"Safety","value":"BPA-Free, Lead-Free, Dishwasher Safe"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000009',
  'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)',
  'apple-macbook-pro-16-m3-max',
  'Supercharged by M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness and up to 22 hours of battery life.',
  3499.00,
  3199.00,
  'c0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000002',
  'APL-MBP16-M3M',
  8,
  2,
  4.8,
  36,
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Space Black","Silver"]}]'::JSONB,
  '[{"key":"Chip","value":"Apple M3 Max"},{"key":"Memory","value":"36GB Unified Memory"},{"key":"Display","value":"16.2-inch Liquid Retina XDR (120Hz ProMotion)"},{"key":"Storage","value":"1TB Superfast NVMe SSD"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000010',
  'Logitech MX Master 3S Performance Wireless Mouse',
  'logitech-mx-master-3s-performance-mouse',
  'Quiet Clicks with 8000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling wheel that scrolls 1,000 lines in a single second with pinpoint tactile precision.',
  99.99,
  89.99,
  'c0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000006',
  'LOGI-MX3S-GRY',
  55,
  8,
  4.8,
  39,
  ARRAY['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Graphite Black","Pale Gray"]}]'::JSONB,
  '[{"key":"Sensor","value":"Darkfield 8000 DPI High Precision"},{"key":"Battery","value":"Up to 70 days per charge (USB-C)"},{"key":"Connectivity","value":"Bluetooth Low Energy & Logi Bolt"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000011',
  'Adidas Ultraboost Light Running Shoes',
  'adidas-ultraboost-light-running-shoes',
  'Experience epic energy return with the lightest BOOST technology ever made. Continental™ Better Rubber outsole for superior wet and dry grip.',
  190.00,
  149.00,
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000007',
  'ADI-UB-LIGHT',
  32,
  6,
  4.8,
  42,
  ARRAY['https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Size","options":["US 8","US 9","US 10","US 11"]},{"name":"Color","options":["Core Black","Cloud White","Solar Red"]}]'::JSONB,
  '[{"key":"Midsole","value":"Light BOOST Foam"},{"key":"Outsole","value":"Continental™ Rubber"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000012',
  'Dyson V15 Detect™ Absolute Cordless Vacuum',
  'dyson-v15-detect-absolute-vacuum',
  'Laser illumination reveals microscopic dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically increasing suction when needed.',
  749.99,
  649.99,
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000005',
  'DYS-V15-ABS',
  10,
  3,
  4.8,
  45,
  ARRAY['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Edition","options":["Standard Absolute","Gold Extra Pack"]}]'::JSONB,
  '[{"key":"Suction Power","value":"240 Air Watts"},{"key":"Run Time","value":"Up to 60 Minutes"},{"key":"Filtration","value":"Whole-machine HEPA filtration"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000013',
  'Sony PlayStation 5 Slim Console (1TB SSD)',
  'sony-playstation-5-slim-console',
  'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
  499.99,
  479.99,
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'SONY-PS5-SLIM',
  15,
  4,
  4.8,
  48,
  ARRAY['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Edition","options":["Disc Edition","Digital Edition"]}]'::JSONB,
  '[{"key":"Storage","value":"1TB Custom NVMe SSD"},{"key":"Resolution","value":"4K 120Hz, 8K Output Support"},{"key":"Audio","value":"Tempest 3D AudioTech"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000014',
  'Samsung 34" Odyssey OLED G8 Curved Gaming Monitor',
  'samsung-34-odyssey-oled-g8-curved-monitor',
  'Stunning Neo Quantum Processor delivers brighter whites, deeper blacks, and near infinite color contrast. Lightning fast 0.03ms response time with 175Hz refresh rate.',
  1199.99,
  999.00,
  'c0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000004',
  'SAM-MON-G8',
  7,
  2,
  4.8,
  51,
  ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[]'::JSONB,
  '[{"key":"Screen Size","value":"34 Inch Curved (1800R)"},{"key":"Panel Type","value":"QD-OLED (3440 x 1440)"},{"key":"Refresh Rate","value":"175Hz"},{"key":"Response Time","value":"0.03ms (GtG)"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000015',
  'Logitech MX Mechanical Wireless Illuminated Keyboard',
  'logitech-mx-mechanical-keyboard',
  'Low-profile mechanical switches for next-level typing feel. Smart backlighting automatically illuminates when hands approach and adjusts to ambient light.',
  169.99,
  149.99,
  'c0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000006',
  'LOGI-MX-MECH',
  24,
  5,
  4.8,
  54,
  ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Layout","options":["Full Size with Numpad","Mini Tenkeyless"]}]'::JSONB,
  '[{"key":"Switch Type","value":"Tactile Quiet Mechanical"},{"key":"Battery","value":"Up to 15 days (with backlight) or 10 months (off)"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000016',
  'Nike Sportswear Tech Fleece Full-Zip Windrunner',
  'nike-sportswear-tech-fleece-full-zip',
  'Our premium lightweight fleece is smooth both inside and out, giving you plenty of warmth without adding bulk. Tailored athletic silhouette.',
  145.00,
  119.00,
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'NIKE-TF-HOOD',
  38,
  6,
  4.8,
  57,
  ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Size","options":["S","M","L","XL","XXL"]},{"name":"Color","options":["Heather Gray","Black","Dark Olive"]}]'::JSONB,
  '[{"key":"Material","value":"53% Cotton / 47% Polyester"},{"key":"Care","value":"Machine Washable"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000017',
  'Adidas Tiro 23 League Athletic Training Track Pants',
  'adidas-tiro-23-league-track-pants',
  'Born on the soccer pitch, styled for the streets. Moisture-absorbing AEROREADY keeps you dry, while ankle zips make for quick on and off over footwear.',
  55.00,
  44.00,
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000007',
  'ADI-TIRO-PNT',
  50,
  8,
  4.8,
  60,
  ARRAY['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Size","options":["S","M","L","XL"]},{"name":"Color","options":["Black / White 3-Stripes","Team Navy"]}]'::JSONB,
  '[{"key":"Technology","value":"AEROREADY Moisture Wicking"},{"key":"Fit","value":"Slim athletic tapered fit"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000018',
  'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
  'apple-airpods-pro-2nd-gen-usbc',
  'Up to 2x more Active Noise Cancellation, Adaptive Audio that tailors noise control to your environment, and Personalized Spatial Audio with dynamic head tracking.',
  249.00,
  199.00,
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'APL-APP2-USBC',
  40,
  5,
  4.8,
  63,
  ARRAY['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[]'::JSONB,
  '[{"key":"Chip","value":"Apple H2 Headphone Chip"},{"key":"Case","value":"MagSafe USB-C with Speaker & Lanyard Loop"},{"key":"Battery","value":"Up to 6 hours listening (30 hrs with case)"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000019',
  'Dyson Airwrap™ Multi-Styler Complete Long',
  'dyson-airwrap-multi-styler-complete',
  'Style with air, not extreme heat. Harnesses the aerodynamic Coanda effect to curl, shape, and hide flyaways using precise airflow controls.',
  599.99,
  549.99,
  'c0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000005',
  'DYS-AIRWRAP-LNG',
  12,
  3,
  4.8,
  66,
  ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Nickel / Copper","Ceramic Pop"]}]'::JSONB,
  '[{"key":"Airflow Speed","value":"3 precise airflow speeds"},{"key":"Attachments","value":"6 styling attachments + storage case"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000020',
  'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
  'sony-alpha-7-iv-full-frame-camera',
  '33MP full-frame Exmor R back-illuminated CMOS sensor. 4K 60p 10-bit 4:2:2 video recording with cinematic S-Cinetone color profile and next-gen real-time tracking autofocus.',
  2499.99,
  2298.00,
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'SONY-A7M4-BODY',
  9,
  2,
  4.8,
  69,
  ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Configuration","options":["Body Only","With 28-70mm Zoom Lens"]}]'::JSONB,
  '[{"key":"Sensor","value":"33 MP Full-Frame Exmor R CMOS"},{"key":"Video Resolution","value":"4K 60p 10-Bit 4:2:2"},{"key":"Autofocus","value":"759 phase-detection AF points"}]'::JSONB,
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000021',
  'Hydro Pure Double-Wall Insulated Steel Flask (32oz)',
  'hydro-pure-double-wall-insulated-flask',
  'Keeps beverages ice cold for 24 hours or piping hot for 12 hours. Pro-grade 18/8 stainless steel with powder-coated sweat-proof exterior and leak-proof flex chug cap.',
  39.99,
  29.99,
  'c0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000003',
  'SPT-FLASK-32OZ',
  65,
  10,
  4.8,
  72,
  ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[{"name":"Color","options":["Pacific Blue","Matte Obsidian","Alpine White"]}]'::JSONB,
  '[{"key":"Capacity","value":"32 oz (946 ml)"},{"key":"Material","value":"18/8 Pro-Grade Stainless Steel"}]'::JSONB,
  true,
  false
),
(
  'p0000000-0000-0000-0000-000000000022',
  'Logitech Brio 4K Ultra HD Streaming & Conference Webcam',
  'logitech-brio-4k-ultra-hd-webcam',
  'Ultra 4K HD video calling with RightLight 3 and HDR technology that automatically balances exposure in direct sunlight or dim light. Windows Hello facial recognition built-in.',
  199.99,
  159.99,
  'c0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000006',
  'LOGI-BRIO-4K',
  26,
  4,
  4.8,
  75,
  ARRAY['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=80']::TEXT[],
  '[]'::JSONB,
  '[{"key":"Resolution","value":"4K Ultra HD @ 30fps / 1080p @ 60fps"},{"key":"Field of View","value":"Adjustable 65°, 78°, and 90°"},{"key":"Microphones","value":"Dual omni-directional noise canceling"}]'::JSONB,
  true,
  false
)
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
(
  'NOVAFIRST',
  'percentage',
  15.00,
  50.00,
  50.00,
  500,
  14,
  true,
  NOW() + INTERVAL '180 days'
),
(
  'SAVE20',
  'percentage',
  20.00,
  100.00,
  80.00,
  250,
  38,
  true,
  NOW() + INTERVAL '180 days'
),
(
  'FLAT50',
  'fixed',
  50.00,
  200.00,
  50.00,
  100,
  22,
  true,
  NOW() + INTERVAL '180 days'
),
(
  'SUMMER10',
  'percentage',
  10.00,
  30.00,
  30.00,
  1000,
  75,
  true,
  NOW() + INTERVAL '180 days'
),
(
  'FLAT10',
  'fixed',
  10.00,
  20.00,
  10.00,
  500,
  5,
  true,
  NOW() + INTERVAL '180 days'
),
(
  'VIPFREESHIP',
  'fixed',
  15.00,
  40.00,
  15.00,
  2000,
  110,
  true,
  NOW() + INTERVAL '180 days'
)
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
  'p0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  5,
  'Unbelievable noise cancelling and rich audio clarity',
  'I travel weekly on cross-country flights and these headphones completely erase airplane cabin roar. The earcups are super comfortable for 8-hour sessions.',
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  5,
  'Top-tier microphones for zoom calls',
  'Clear sound reproduction and the microphone filter isolates background noise brilliantly. Multipoint bluetooth connects to my phone and laptop at the same time.',
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000001',
  5,
  'Double tap gesture is genuinely revolutionary',
  'Answering phone calls and dismissing timers with one hand while holding coffee is effortless. Battery easily lasts all day with workout tracking.',
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000002',
  4,
  'Very comfortable daily sneakers with great bounce',
  'The heel air unit provides great shock absorption. Sizing runs true to size. Looks sharp with jeans or running shorts.',
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000009',
  'd0000000-0000-0000-0000-000000000003',
  5,
  'Unrivaled computational power and battery endurance',
  'Renders 8K video timelines seamlessly without the fans even kicking on. The XDR display has deep blacks and vibrant contrast. Best workstation on the market.',
  true,
  true
),
(
  'p0000000-0000-0000-0000-000000000010',
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
