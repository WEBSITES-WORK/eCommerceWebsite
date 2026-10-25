const fs = require('fs');
const path = require('path');

// Read seedData source to extract structured records
const seedFile = fs.readFileSync(path.join(__dirname, 'seedData.js'), 'utf-8');

// Categories definition
const categories = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'Cutting-edge gadgets, flagship smartphones, noise-cancelling headphones, and computing gear.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    description: 'Contemporary streetwear, performance footwear, athleisure, and premium lifestyle accessories.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Modern ergonomic office furniture, artisan dinnerware, ambient lighting, and decor.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'Beauty & Wellness',
    slug: 'beauty',
    description: 'Intelligent haircare appliances, advanced skincare routines, and personal wellness essentials.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    name: 'Fitness & Sports',
    slug: 'sports',
    description: 'High-performance gym gear, training apparatus, running shoes, and outdoor gear.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000006',
    name: 'Laptops & Workspaces',
    slug: 'laptops-workspace',
    description: 'Productivity laptops, high-speed monitors, mechanical keyboards, and precision peripherals.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

// Brands definition
const brands = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Sony',
    slug: 'sony',
    description: 'World pioneer in consumer electronics, high-resolution audio, and visual innovations.',
    logo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    name: 'Apple',
    slug: 'apple',
    description: 'Visionary consumer technology including iPhone, Apple Watch, and MacBook computers.',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    name: 'Nike',
    slug: 'nike',
    description: 'World-renowned athletic footwear, apparel, sports equipment, and running innovations.',
    logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    name: 'Samsung',
    slug: 'samsung',
    description: 'Global leader in mobile communications, OLED displays, and smart appliances.',
    logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000005',
    name: 'Dyson',
    slug: 'dyson',
    description: 'Groundbreaking air science engineering, supersonic hair dryers, and vacuum appliances.',
    logo: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000006',
    name: 'Logitech',
    slug: 'logitech',
    description: 'Precision ergonomic mice, mechanical gaming keyboards, and streaming peripherals.',
    logo: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=200&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000007',
    name: 'Adidas',
    slug: 'adidas',
    description: 'Pioneering performance sportswear, Boost cushioning, and classic street sneakers.',
    logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

// Mapping helper
const catMap = {
  electronics: 'c1000000-0000-0000-0000-000000000001',
  fashion: 'c1000000-0000-0000-0000-000000000002',
  'home-living': 'c1000000-0000-0000-0000-000000000003',
  beauty: 'c1000000-0000-0000-0000-000000000004',
  sports: 'c1000000-0000-0000-0000-000000000005',
  'laptops-workspace': 'c1000000-0000-0000-0000-000000000006',
};

const brandMap = {
  sony: 'b1000000-0000-0000-0000-000000000001',
  apple: 'b1000000-0000-0000-0000-000000000002',
  nike: 'b1000000-0000-0000-0000-000000000003',
  samsung: 'b1000000-0000-0000-0000-000000000004',
  dyson: 'b1000000-0000-0000-0000-000000000005',
  logitech: 'b1000000-0000-0000-0000-000000000006',
  adidas: 'b1000000-0000-0000-0000-000000000007',
};

console.log('Generating Supabase seed SQL script...');
