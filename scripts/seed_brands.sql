-- 2. BRANDS
INSERT INTO public.brands (id, name, slug, description, logo_url, logo, website_url, is_active) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Sony', 'sony', 'World pioneer in consumer electronics, high-resolution audio, and visual innovations.', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80', 'https://www.sony.com', true),
  ('b0000000-0000-0000-0000-000000000002', 'Apple', 'apple', 'Visionary consumer technology including iPhone, Apple Watch, and MacBook computers.', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80', 'https://www.apple.com', true),
  ('b0000000-0000-0000-0000-000000000003', 'Nike', 'nike', 'World-renowned athletic footwear, apparel, sports equipment, and running innovations.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80', 'https://www.nike.com', true),
  ('b0000000-0000-0000-0000-000000000004', 'Samsung', 'samsung', 'Global leader in mobile communications, OLED displays, and smart appliances.', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&auto=format&fit=crop&q=80', 'https://www.samsung.com', true),
  ('b0000000-0000-0000-0000-000000000005', 'Dyson', 'dyson', 'Groundbreaking air science engineering, supersonic hair dryers, and vacuum appliances.', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&auto=format&fit=crop&q=80', 'https://www.dyson.com', true),
  ('b0000000-0000-0000-0000-000000000006', 'Logitech', 'logitech', 'Precision ergonomic mice, mechanical gaming keyboards, and streaming peripherals.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=200&auto=format&fit=crop&q=80', 'https://www.logitech.com', true),
  ('b0000000-0000-0000-0000-000000000007', 'Adidas', 'adidas', 'Pioneering performance sportswear, Boost cushioning, and classic street sneakers.', 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&auto=format&fit=crop&q=80', 'https://www.adidas.com', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  logo = EXCLUDED.logo,
  website_url = EXCLUDED.website_url,
  is_active = EXCLUDED.is_active;