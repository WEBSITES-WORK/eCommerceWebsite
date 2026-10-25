-- 1. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, image, is_active, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Electronics & Audio', 'electronics', 'Cutting-edge gadgets, flagship smartphones, noise-cancelling headphones, and computing gear.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', true, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Fashion & Apparel', 'fashion', 'Contemporary streetwear, performance footwear, athleisure, and premium lifestyle accessories.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80', true, 2),
  ('c0000000-0000-0000-0000-000000000003', 'Home & Living', 'home-living', 'Modern ergonomic office furniture, artisan dinnerware, ambient lighting, and decor.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80', true, 3),
  ('c0000000-0000-0000-0000-000000000004', 'Beauty & Wellness', 'beauty', 'Intelligent haircare appliances, advanced skincare routines, and personal wellness essentials.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80', true, 4),
  ('c0000000-0000-0000-0000-000000000005', 'Fitness & Sports', 'sports', 'High-performance gym gear, training apparatus, running shoes, and outdoor gear.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80', true, 5),
  ('c0000000-0000-0000-0000-000000000006', 'Laptops & Workspaces', 'laptops-workspace', 'Productivity laptops, high-speed monitors, mechanical keyboards, and precision peripherals.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', true, 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  image = EXCLUDED.image,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;