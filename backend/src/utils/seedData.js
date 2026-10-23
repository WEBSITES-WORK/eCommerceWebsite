const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Setting = require('../models/Setting');
const Review = require('../models/Review');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/novashop_ecommerce';
    console.log(`Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding!');

    // 1. Clear existing database collections
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Setting.deleteMany();
    await Review.deleteMany();
    await Address.deleteMany();
    await Order.deleteMany();
    await Notification.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();

    console.log('Cleared existing database collections.');

    // 2. Global Website & Store Configuration
    await Setting.create({
      storeName: 'NovaShop',
      storeEmail: 'support@novashop.com',
      storePhone: '+1 (800) 555-0199',
      address: '100 Market Street, Suite 400, San Francisco, CA 94105',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 8.5,
      shippingFee: 15.0,
      freeShippingThreshold: 99.0,
      announcementBar: '✨ Free express shipping on orders over $99! Use coupon NOVAFIRST for 15% off.',
      showAnnouncement: true,
    });
    console.log('Created Store Settings.');

    // 3. User Accounts (1 Admin, 3 Sample Customers)
    const adminUser = await User.create({
      name: 'Admin Director',
      email: 'admin@ecommerce.com',
      password: 'Admin123!',
      role: 'admin',
      phone: '+1 555-0100',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });

    const customer1 = await User.create({
      name: 'Sarah Connor',
      email: 'customer@ecommerce.com',
      password: 'Customer123!',
      role: 'customer',
      phone: '+1 555-0145',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    });

    const customer2 = await User.create({
      name: 'Alex Rivers',
      email: 'alex.rivers@ecommerce.com',
      password: 'Customer123!',
      role: 'customer',
      phone: '+1 555-0178',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    });

    const customer3 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@ecommerce.com',
      password: 'Customer123!',
      role: 'customer',
      phone: '+1 555-0192',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    });

    console.log('Created 1 Admin and 3 Customer accounts.');

    // 4. Sample Shipping Addresses
    const sarahAddress = await Address.create({
      user: customer1._id,
      fullName: 'Sarah Connor',
      phone: '+1 555-0145',
      streetAddress: '742 Evergreen Terrace',
      apartment: 'Apt 4B',
      city: 'Springfield',
      state: 'Oregon',
      postalCode: '97477',
      country: 'United States',
      isDefault: true,
      addressType: 'Home',
    });

    await Address.create({
      user: customer2._id,
      fullName: 'Alex Rivers',
      phone: '+1 555-0178',
      streetAddress: '450 Mission Street',
      apartment: 'Suite 1200',
      city: 'San Francisco',
      state: 'California',
      postalCode: '94105',
      country: 'United States',
      isDefault: true,
      addressType: 'Office',
    });

    // 5. Product Categories
    const categoriesData = [
      {
        name: 'Electronics & Audio',
        slug: 'electronics',
        description: 'Cutting-edge gadgets, flagship smartphones, noise-cancelling headphones, and computing gear.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        icon: 'Headphones',
        displayOrder: 1,
      },
      {
        name: 'Fashion & Apparel',
        slug: 'fashion',
        description: 'Contemporary streetwear, performance footwear, athleisure, and premium lifestyle accessories.',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
        icon: 'Shirt',
        displayOrder: 2,
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Modern ergonomic office furniture, artisan dinnerware, ambient lighting, and decor.',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
        icon: 'Home',
        displayOrder: 3,
      },
      {
        name: 'Beauty & Wellness',
        slug: 'beauty',
        description: 'Intelligent haircare appliances, advanced skincare routines, and personal wellness essentials.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        icon: 'Sparkles',
        displayOrder: 4,
      },
      {
        name: 'Fitness & Sports',
        slug: 'sports',
        description: 'High-performance gym gear, training apparatus, running shoes, and outdoor gear.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        icon: 'Dumbbell',
        displayOrder: 5,
      },
      {
        name: 'Laptops & Workspaces',
        slug: 'laptops-workspace',
        description: 'Productivity laptops, high-speed monitors, mechanical keyboards, and precision peripherals.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        icon: 'Laptop',
        displayOrder: 6,
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });
    console.log(`Created ${categories.length} Categories.`);

    // 6. Global Brands
    const brandsData = [
      {
        name: 'Sony',
        slug: 'sony',
        description: 'World pioneer in consumer electronics, high-resolution audio, and visual innovations.',
        logo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80',
        website: 'https://www.sony.com',
      },
      {
        name: 'Apple',
        slug: 'apple',
        description: 'Visionary consumer technology including iPhone, Apple Watch, and MacBook computers.',
        logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80',
        website: 'https://www.apple.com',
      },
      {
        name: 'Nike',
        slug: 'nike',
        description: 'World-renowned athletic footwear, apparel, sports equipment, and running innovations.',
        logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
        website: 'https://www.nike.com',
      },
      {
        name: 'Samsung',
        slug: 'samsung',
        description: 'Global leader in mobile communications, OLED displays, and smart appliances.',
        logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&auto=format&fit=crop&q=80',
        website: 'https://www.samsung.com',
      },
      {
        name: 'Dyson',
        slug: 'dyson',
        description: 'Groundbreaking air science engineering, supersonic hair dryers, and vacuum appliances.',
        logo: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&auto=format&fit=crop&q=80',
        website: 'https://www.dyson.com',
      },
      {
        name: 'Logitech',
        slug: 'logitech',
        description: 'Precision ergonomic mice, mechanical gaming keyboards, and streaming peripherals.',
        logo: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=200&auto=format&fit=crop&q=80',
        website: 'https://www.logitech.com',
      },
      {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Pioneering performance sportswear, Boost cushioning, and classic street sneakers.',
        logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&auto=format&fit=crop&q=80',
        website: 'https://www.adidas.com',
      },
    ];

    const brands = await Brand.insertMany(brandsData);
    const brandMap = {};
    brands.forEach((b) => {
      brandMap[b.slug] = b._id;
    });
    console.log(`Created ${brands.length} Brands.`);

    // 7. 22 Realistic Products
    const productsData = [
      // 1. Sony WH-1000XM5
      {
        title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        sku: 'SONY-WH1000XM5-BLK',
        description:
          'Industry-leading active noise canceling with two processors and eight microphones. Exceptional sound quality engineered to perfection with High-Resolution Audio support and crystal-clear hands-free calling.',
        price: 399.99,
        discountPrice: 348.0,
        stock: 35,
        lowStockThreshold: 5,
        category: catMap['electronics'],
        brand: brandMap['sony'],
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Battery Life', value: '30 Hours (ANC On)' },
          { key: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm AUX' },
          { key: 'Weight', value: '250 grams' },
          { key: 'Noise Cancellation', value: 'Dual Processor QN1 + V1' },
        ],
        variants: [
          { name: 'Color', options: ['Midnight Black', 'Platinum Silver', 'Navy Blue'] },
        ],
        tags: ['audio', 'bluetooth', 'noise cancelling', 'sony', 'headphones'],
      },

      // 2. Apple Watch Series 9
      {
        title: 'Apple Watch Series 9 GPS 45mm Aluminum Case',
        slug: 'apple-watch-series-9-gps-45mm',
        sku: 'APL-W9-45M',
        description:
          'Smarter, brighter, and mightier. Powered by the S9 SiP with Double Tap gesture control, a magically bright 2000-nit Always-On display, and precision iPhone finding.',
        price: 429.0,
        discountPrice: 379.0,
        stock: 22,
        lowStockThreshold: 4,
        category: catMap['electronics'],
        brand: brandMap['apple'],
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: true,
        isNewArrival: true,
        specifications: [
          { key: 'Display', value: 'Always-On Retina OLED (2000 nits)' },
          { key: 'Processor', value: 'Apple S9 SiP' },
          { key: 'Water Resistance', value: '50m Swimproof' },
        ],
        variants: [
          { name: 'Color', options: ['Midnight', 'Starlight', 'Silver'] },
          { name: 'Band Size', options: ['S/M', 'M/L'] },
        ],
        tags: ['smartwatch', 'apple', 'fitness', 'wearables', 'heart rate'],
      },

      // 3. Nike Air Max 270
      {
        title: 'Nike Air Max 270 React Flyknit Sneakers',
        slug: 'nike-air-max-270-react-flyknit',
        sku: 'NIKE-AM270-RED',
        description:
          "Nike's biggest heel Air unit yet delivers ultra-soft cushioning that feels as impossible as it looks. The lightweight Flyknit upper hugs your foot for an effortless run or casual daily wear.",
        price: 160.0,
        discountPrice: 129.99,
        stock: 45,
        lowStockThreshold: 8,
        category: catMap['fashion'],
        brand: brandMap['nike'],
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Cushioning', value: 'React Foam + Max Air 270 Heel Unit' },
          { key: 'Upper Material', value: 'Breathable Flyknit Fabric' },
          { key: 'Gender', value: 'Unisex' },
        ],
        variants: [
          { name: 'Size', options: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'] },
          { name: 'Color', options: ['University Red', 'Triple Black', 'Pure White'] },
        ],
        tags: ['shoes', 'sneakers', 'nike', 'running', 'streetwear'],
      },

      // 4. Samsung Galaxy S24 Ultra
      {
        title: 'Samsung Galaxy S24 Ultra 5G (512GB Titanium)',
        slug: 'samsung-galaxy-s24-ultra-5g-512gb',
        sku: 'SAM-S24U-512',
        description:
          'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Integrated S Pen, 200MP camera system, and Galaxy AI built right in.',
        price: 1399.0,
        discountPrice: 1249.0,
        stock: 14,
        lowStockThreshold: 3,
        category: catMap['electronics'],
        brand: brandMap['samsung'],
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: false,
        isNewArrival: true,
        specifications: [
          { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
          { key: 'Storage', value: '512GB UFS 4.0' },
          { key: 'Main Camera', value: '200 MP Quad Telephoto' },
          { key: 'Battery', value: '5,000 mAh Fast Charging' },
        ],
        variants: [
          { name: 'Color', options: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'] },
        ],
        tags: ['smartphone', 'samsung', '5g', 'galaxy ai', 'android'],
      },

      // 5. Dyson Supersonic Hair Dryer
      {
        title: 'Dyson Supersonic™ Intelligent Hair Dryer',
        slug: 'dyson-supersonic-intelligent-hair-dryer',
        sku: 'DYS-SUPER-V2',
        description:
          'Engineered for different hair types, fast drying with no extreme heat. Powered by the small, powerful Dyson digital motor V9 combined with Air Multiplier™ technology.',
        price: 429.99,
        discountPrice: 399.0,
        stock: 18,
        lowStockThreshold: 4,
        category: catMap['beauty'],
        brand: brandMap['dyson'],
        images: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: true,
        isNewArrival: true,
        specifications: [
          { key: 'Motor', value: 'Dyson V9 digital motor' },
          { key: 'Heat Settings', value: '4 precise heat settings' },
          { key: 'Attachments', value: 'Flyaway attachment, Styling concentrator' },
        ],
        variants: [
          { name: 'Color', options: ['Iron / Fuchsia', 'Copper / Nickel', 'Prussian Blue'] },
        ],
        tags: ['haircare', 'dyson', 'beauty', 'styling'],
      },

      // 6. Ergonomic Mesh Chair
      {
        title: 'Ergonomic Mesh Executive Desk Chair',
        slug: 'ergonomic-mesh-executive-desk-chair',
        sku: 'HOME-CHAIR-ERG',
        description:
          'High back breathable mesh chair with 3D adjustable armrests, dynamic lumbar support, and smooth multi-angle reclining mechanism for all-day posture comfort.',
        price: 289.0,
        discountPrice: 229.0,
        stock: 16,
        lowStockThreshold: 5,
        category: catMap['home-living'],
        brand: brandMap['logitech'],
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: false,
        isNewArrival: true,
        specifications: [
          { key: 'Max Weight Capacity', value: '300 lbs' },
          { key: 'Material', value: 'High-density breathable Korean mesh' },
          { key: 'Warranty', value: '5 Years' },
        ],
        variants: [
          { name: 'Color', options: ['Space Gray', 'Onyx Black'] },
        ],
        tags: ['furniture', 'office', 'ergonomic', 'chair'],
      },

      // 7. Resistance Bands Kit
      {
        title: 'Pro Aerobic High-Tension Resistance Bands Kit',
        slug: 'pro-aerobic-resistance-bands-kit',
        sku: 'SPT-BAND-SET',
        description:
          'Set of 5 stackable resistance tubes ranging from 10 to 50 lbs (up to 150 lbs combined) with door anchor, cushioned handles, and ankle straps.',
        price: 49.99,
        discountPrice: 34.99,
        stock: 60,
        lowStockThreshold: 10,
        category: catMap['sports'],
        brand: brandMap['nike'],
        images: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Material', value: '100% Natural Malaysian Latex' },
          { key: 'Tension Range', value: '10 lbs to 150 lbs combined' },
        ],
        variants: [],
        tags: ['fitness', 'workout', 'gym', 'sports'],
      },

      // 8. Ceramic Dinnerware
      {
        title: 'Minimalist Matte Ceramic Dinnerware Set (16-Piece)',
        slug: 'minimalist-matte-ceramic-dinnerware-set',
        sku: 'KIT-CER-16P',
        description:
          'Service for 4 crafted from durable stoneware with modern organic rims and a scratch-resistant satin matte finish. Microwave and dishwasher safe.',
        price: 139.0,
        discountPrice: 109.0,
        stock: 28,
        lowStockThreshold: 5,
        category: catMap['home-living'],
        brand: brandMap['sony'],
        images: [
          'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: false,
        isNewArrival: true,
        specifications: [
          { key: 'Pieces', value: '4 Dinner plates, 4 Salad plates, 4 Bowls, 4 Mugs' },
          { key: 'Safety', value: 'BPA-Free, Lead-Free, Dishwasher Safe' },
        ],
        variants: [
          { name: 'Finish', options: ['Matte Charcoal', 'Sand Dune Beige', 'Sage Green'] },
        ],
        tags: ['kitchen', 'home', 'dinnerware', 'plates'],
      },

      // 9. MacBook Pro 16 M3 Max
      {
        title: 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)',
        slug: 'apple-macbook-pro-16-m3-max',
        sku: 'APL-MBP16-M3M',
        description:
          'Supercharged by M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness and up to 22 hours of battery life.',
        price: 3499.0,
        discountPrice: 3199.0,
        stock: 8,
        lowStockThreshold: 2,
        category: catMap['laptops-workspace'],
        brand: brandMap['apple'],
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: true,
        isNewArrival: true,
        specifications: [
          { key: 'Chip', value: 'Apple M3 Max' },
          { key: 'Memory', value: '36GB Unified Memory' },
          { key: 'Display', value: '16.2-inch Liquid Retina XDR (120Hz ProMotion)' },
          { key: 'Storage', value: '1TB Superfast NVMe SSD' },
        ],
        variants: [
          { name: 'Color', options: ['Space Black', 'Silver'] },
        ],
        tags: ['laptop', 'macbook', 'apple', 'm3 max', 'pro computer'],
      },

      // 10. Logitech MX Master 3S
      {
        title: 'Logitech MX Master 3S Performance Wireless Mouse',
        slug: 'logitech-mx-master-3s-performance-mouse',
        sku: 'LOGI-MX3S-GRY',
        description:
          'Quiet Clicks with 8000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling wheel that scrolls 1,000 lines in a single second with pinpoint tactile precision.',
        price: 99.99,
        discountPrice: 89.99,
        stock: 55,
        lowStockThreshold: 8,
        category: catMap['laptops-workspace'],
        brand: brandMap['logitech'],
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Sensor', value: 'Darkfield 8000 DPI High Precision' },
          { key: 'Battery', value: 'Up to 70 days per charge (USB-C)' },
          { key: 'Connectivity', value: 'Bluetooth Low Energy & Logi Bolt' },
        ],
        variants: [
          { name: 'Color', options: ['Graphite Black', 'Pale Gray'] },
        ],
        tags: ['mouse', 'logitech', 'productivity', 'bluetooth', 'workspace'],
      },

      // 11. Adidas Ultraboost Light
      {
        title: 'Adidas Ultraboost Light Running Shoes',
        slug: 'adidas-ultraboost-light-running-shoes',
        sku: 'ADI-UB-LIGHT',
        description:
          'Experience epic energy return with the lightest BOOST technology ever made. Continental™ Better Rubber outsole for superior wet and dry grip.',
        price: 190.0,
        discountPrice: 149.0,
        stock: 32,
        lowStockThreshold: 6,
        category: catMap['fashion'],
        brand: brandMap['adidas'],
        images: [
          'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: true,
        isNewArrival: true,
        specifications: [
          { key: 'Midsole', value: 'Light BOOST Foam' },
          { key: 'Outsole', value: 'Continental™ Rubber' },
        ],
        variants: [
          { name: 'Size', options: ['US 8', 'US 9', 'US 10', 'US 11'] },
          { name: 'Color', options: ['Core Black', 'Cloud White', 'Solar Red'] },
        ],
        tags: ['shoes', 'sneakers', 'adidas', 'ultraboost', 'running'],
      },

      // 12. Dyson V15 Detect Vacuum
      {
        title: 'Dyson V15 Detect™ Absolute Cordless Vacuum',
        slug: 'dyson-v15-detect-absolute-vacuum',
        sku: 'DYS-V15-ABS',
        description:
          'Laser illumination reveals microscopic dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically increasing suction when needed.',
        price: 749.99,
        discountPrice: 649.99,
        stock: 10,
        lowStockThreshold: 3,
        category: catMap['home-living'],
        brand: brandMap['dyson'],
        images: [
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: false,
        isNewArrival: true,
        specifications: [
          { key: 'Suction Power', value: '240 Air Watts' },
          { key: 'Run Time', value: 'Up to 60 Minutes' },
          { key: 'Filtration', value: 'Whole-machine HEPA filtration' },
        ],
        variants: [
          { name: 'Edition', options: ['Standard Absolute', 'Gold Extra Pack'] },
        ],
        tags: ['vacuum', 'dyson', 'cleaning', 'home appliance', 'cordless'],
      },

      // 13. Sony PlayStation 5 Slim
      {
        title: 'Sony PlayStation 5 Slim Console (1TB SSD)',
        slug: 'sony-playstation-5-slim-console',
        sku: 'SONY-PS5-SLIM',
        description:
          'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
        price: 499.99,
        discountPrice: 479.99,
        stock: 15,
        lowStockThreshold: 4,
        category: catMap['electronics'],
        brand: brandMap['sony'],
        images: [
          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Storage', value: '1TB Custom NVMe SSD' },
          { key: 'Resolution', value: '4K 120Hz, 8K Output Support' },
          { key: 'Audio', value: 'Tempest 3D AudioTech' },
        ],
        variants: [
          { name: 'Edition', options: ['Disc Edition', 'Digital Edition'] },
        ],
        tags: ['gaming', 'ps5', 'playstation', 'sony', 'console'],
      },

      // 14. Samsung 34" Odyssey OLED G8
      {
        title: 'Samsung 34" Odyssey OLED G8 Curved Gaming Monitor',
        slug: 'samsung-34-odyssey-oled-g8-curved-monitor',
        sku: 'SAM-MON-G8',
        description:
          'Stunning Neo Quantum Processor delivers brighter whites, deeper blacks, and near infinite color contrast. Lightning fast 0.03ms response time with 175Hz refresh rate.',
        price: 1199.99,
        discountPrice: 999.0,
        stock: 7,
        lowStockThreshold: 2,
        category: catMap['laptops-workspace'],
        brand: brandMap['samsung'],
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: false,
        isNewArrival: true,
        specifications: [
          { key: 'Screen Size', value: '34 Inch Curved (1800R)' },
          { key: 'Panel Type', value: 'QD-OLED (3440 x 1440)' },
          { key: 'Refresh Rate', value: '175Hz' },
          { key: 'Response Time', value: '0.03ms (GtG)' },
        ],
        variants: [],
        tags: ['monitor', 'gaming', 'oled', 'samsung', 'curved display'],
      },

      // 15. Logitech MX Mechanical Wireless Keyboard
      {
        title: 'Logitech MX Mechanical Wireless Illuminated Keyboard',
        slug: 'logitech-mx-mechanical-keyboard',
        sku: 'LOGI-MX-MECH',
        description:
          'Low-profile mechanical switches for next-level typing feel. Smart backlighting automatically illuminates when hands approach and adjusts to ambient light.',
        price: 169.99,
        discountPrice: 149.99,
        stock: 24,
        lowStockThreshold: 5,
        category: catMap['laptops-workspace'],
        brand: brandMap['logitech'],
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Switch Type', value: 'Tactile Quiet Mechanical' },
          { key: 'Battery', value: 'Up to 15 days (with backlight) or 10 months (off)' },
        ],
        variants: [
          { name: 'Layout', options: ['Full Size with Numpad', 'Mini Tenkeyless'] },
        ],
        tags: ['keyboard', 'mechanical', 'logitech', 'typing', 'workspace'],
      },

      // 16. Nike Tech Fleece Windrunner Hoodie
      {
        title: 'Nike Sportswear Tech Fleece Full-Zip Windrunner',
        slug: 'nike-sportswear-tech-fleece-full-zip',
        sku: 'NIKE-TF-HOOD',
        description:
          'Our premium lightweight fleece is smooth both inside and out, giving you plenty of warmth without adding bulk. Tailored athletic silhouette.',
        price: 145.0,
        discountPrice: 119.0,
        stock: 38,
        lowStockThreshold: 6,
        category: catMap['fashion'],
        brand: brandMap['nike'],
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: true,
        isNewArrival: true,
        specifications: [
          { key: 'Material', value: '53% Cotton / 47% Polyester' },
          { key: 'Care', value: 'Machine Washable' },
        ],
        variants: [
          { name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'Color', options: ['Heather Gray', 'Black', 'Dark Olive'] },
        ],
        tags: ['hoodie', 'apparel', 'nike', 'tech fleece', 'streetwear'],
      },

      // 17. Adidas Tiro 23 League Training Pants
      {
        title: 'Adidas Tiro 23 League Athletic Training Track Pants',
        slug: 'adidas-tiro-23-league-track-pants',
        sku: 'ADI-TIRO-PNT',
        description:
          'Born on the soccer pitch, styled for the streets. Moisture-absorbing AEROREADY keeps you dry, while ankle zips make for quick on and off over footwear.',
        price: 55.0,
        discountPrice: 44.0,
        stock: 50,
        lowStockThreshold: 8,
        category: catMap['fashion'],
        brand: brandMap['adidas'],
        images: [
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: false,
        isNewArrival: false,
        specifications: [
          { key: 'Technology', value: 'AEROREADY Moisture Wicking' },
          { key: 'Fit', value: 'Slim athletic tapered fit' },
        ],
        variants: [
          { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
          { name: 'Color', options: ['Black / White 3-Stripes', 'Team Navy'] },
        ],
        tags: ['pants', 'adidas', 'track pants', 'sports', 'athleisure'],
      },

      // 18. Apple AirPods Pro 2nd Gen
      {
        title: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
        slug: 'apple-airpods-pro-2nd-gen-usbc',
        sku: 'APL-APP2-USBC',
        description:
          'Up to 2x more Active Noise Cancellation, Adaptive Audio that tailors noise control to your environment, and Personalized Spatial Audio with dynamic head tracking.',
        price: 249.0,
        discountPrice: 199.0,
        stock: 40,
        lowStockThreshold: 5,
        category: catMap['electronics'],
        brand: brandMap['apple'],
        images: [
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Chip', value: 'Apple H2 Headphone Chip' },
          { key: 'Case', value: 'MagSafe USB-C with Speaker & Lanyard Loop' },
          { key: 'Battery', value: 'Up to 6 hours listening (30 hrs with case)' },
        ],
        variants: [],
        tags: ['airpods', 'apple', 'earbuds', 'anc', 'wireless audio'],
      },

      // 19. Dyson Airwrap Multi-Styler
      {
        title: 'Dyson Airwrap™ Multi-Styler Complete Long',
        slug: 'dyson-airwrap-multi-styler-complete',
        sku: 'DYS-AIRWRAP-LNG',
        description:
          'Style with air, not extreme heat. Harnesses the aerodynamic Coanda effect to curl, shape, and hide flyaways using precise airflow controls.',
        price: 599.99,
        discountPrice: 549.99,
        stock: 12,
        lowStockThreshold: 3,
        category: catMap['beauty'],
        brand: brandMap['dyson'],
        images: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: true,
        isNewArrival: true,
        specifications: [
          { key: 'Airflow Speed', value: '3 precise airflow speeds' },
          { key: 'Attachments', value: '6 styling attachments + storage case' },
        ],
        variants: [
          { name: 'Color', options: ['Nickel / Copper', 'Ceramic Pop'] },
        ],
        tags: ['hair styling', 'dyson', 'airwrap', 'beauty', 'curler'],
      },

      // 20. Sony Alpha 7 IV Full-Frame Camera
      {
        title: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
        slug: 'sony-alpha-7-iv-full-frame-camera',
        sku: 'SONY-A7M4-BODY',
        description:
          '33MP full-frame Exmor R back-illuminated CMOS sensor. 4K 60p 10-bit 4:2:2 video recording with cinematic S-Cinetone color profile and next-gen real-time tracking autofocus.',
        price: 2499.99,
        discountPrice: 2298.0,
        stock: 9,
        lowStockThreshold: 2,
        category: catMap['electronics'],
        brand: brandMap['sony'],
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: true,
        isBestseller: false,
        isNewArrival: false,
        specifications: [
          { key: 'Sensor', value: '33 MP Full-Frame Exmor R CMOS' },
          { key: 'Video Resolution', value: '4K 60p 10-Bit 4:2:2' },
          { key: 'Autofocus', value: '759 phase-detection AF points' },
        ],
        variants: [
          { name: 'Configuration', options: ['Body Only', 'With 28-70mm Zoom Lens'] },
        ],
        tags: ['camera', 'sony', 'mirrorless', 'photography', '4k video'],
      },

      // 21. Stainless Steel Hydro Pure Thermal Flask (32oz)
      {
        title: 'Hydro Pure Double-Wall Insulated Steel Flask (32oz)',
        slug: 'hydro-pure-double-wall-insulated-flask',
        sku: 'SPT-FLASK-32OZ',
        description:
          'Keeps beverages ice cold for 24 hours or piping hot for 12 hours. Pro-grade 18/8 stainless steel with powder-coated sweat-proof exterior and leak-proof flex chug cap.',
        price: 39.99,
        discountPrice: 29.99,
        stock: 65,
        lowStockThreshold: 10,
        category: catMap['sports'],
        brand: brandMap['nike'],
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: true,
        isNewArrival: false,
        specifications: [
          { key: 'Capacity', value: '32 oz (946 ml)' },
          { key: 'Material', value: '18/8 Pro-Grade Stainless Steel' },
        ],
        variants: [
          { name: 'Color', options: ['Pacific Blue', 'Matte Obsidian', 'Alpine White'] },
        ],
        tags: ['water bottle', 'fitness', 'sports', 'hydration', 'insulated'],
      },

      // 22. Logitech Brio 4K Ultra HD Pro Webcam
      {
        title: 'Logitech Brio 4K Ultra HD Streaming & Conference Webcam',
        slug: 'logitech-brio-4k-ultra-hd-webcam',
        sku: 'LOGI-BRIO-4K',
        description:
          'Ultra 4K HD video calling with RightLight 3 and HDR technology that automatically balances exposure in direct sunlight or dim light. Windows Hello facial recognition built-in.',
        price: 199.99,
        discountPrice: 159.99,
        stock: 26,
        lowStockThreshold: 4,
        category: catMap['laptops-workspace'],
        brand: brandMap['logitech'],
        images: [
          'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=80',
        ],
        isFeatured: false,
        isBestseller: false,
        isNewArrival: true,
        specifications: [
          { key: 'Resolution', value: '4K Ultra HD @ 30fps / 1080p @ 60fps' },
          { key: 'Field of View', value: 'Adjustable 65°, 78°, and 90°' },
          { key: 'Microphones', value: 'Dual omni-directional noise canceling' },
        ],
        variants: [],
        tags: ['webcam', '4k', 'logitech', 'streaming', 'remote work'],
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`Created ${products.length} Products.`);

    // Map products by slug for relation seeding
    const prodMap = {};
    products.forEach((p) => {
      prodMap[p.slug] = p;
    });

    // 8. Realistic Coupons
    const couponsData = [
      {
        code: 'NOVAFIRST',
        discountType: 'percentage',
        discountAmount: 15,
        minOrderAmount: 50,
        maxDiscountAmount: 50,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        usageLimit: 500,
        usedCount: 14,
        userUsageLimit: 1,
        isActive: true,
      },
      {
        code: 'SAVE20',
        discountType: 'percentage',
        discountAmount: 20,
        minOrderAmount: 100,
        maxDiscountAmount: 80,
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        usageLimit: 250,
        usedCount: 38,
        userUsageLimit: 1,
        isActive: true,
      },
      {
        code: 'FLAT50',
        discountType: 'fixed',
        discountAmount: 50,
        minOrderAmount: 200,
        maxDiscountAmount: 50,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usedCount: 22,
        userUsageLimit: 1,
        isActive: true,
      },
      {
        code: 'SUMMER10',
        discountType: 'percentage',
        discountAmount: 10,
        minOrderAmount: 30,
        maxDiscountAmount: 30,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        usedCount: 75,
        userUsageLimit: 2,
        isActive: true,
      },
      {
        code: 'FLAT10',
        discountType: 'fixed',
        discountAmount: 10,
        minOrderAmount: 20,
        maxDiscountAmount: 10,
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        usedCount: 5,
        userUsageLimit: 1,
        isActive: true,
      },
      {
        code: 'VIPFREESHIP',
        discountType: 'fixed',
        discountAmount: 15,
        minOrderAmount: 40,
        maxDiscountAmount: 15,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: 2000,
        usedCount: 110,
        userUsageLimit: 3,
        isActive: true,
      },
    ];

    const coupons = await Coupon.insertMany(couponsData);
    console.log(`Created ${coupons.length} Promotional Coupons.`);

    // 9. Verified Customer Reviews (Triggers auto-recalculation hook)
    const reviewsData = [
      {
        product: prodMap['sony-wh-1000xm5-wireless-headphones']._id,
        user: customer1._id,
        rating: 5,
        title: 'Unbelievable noise cancelling and rich audio clarity',
        comment:
          'I travel weekly on cross-country flights and these headphones completely erase airplane cabin roar. The earcups are super comfortable for 8-hour sessions.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        product: prodMap['sony-wh-1000xm5-wireless-headphones']._id,
        user: customer2._id,
        rating: 5,
        title: 'Top-tier microphones for zoom calls',
        comment:
          'Clear sound reproduction and the microphone filter isolates background noise brilliantly. Multipoint bluetooth connects to my phone and laptop at the same time.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        product: prodMap['apple-watch-series-9-gps-45mm']._id,
        user: customer1._id,
        rating: 5,
        title: 'Double tap gesture is genuinely revolutionary',
        comment:
          'Answering phone calls and dismissing timers with one hand while holding coffee is effortless. Battery easily lasts all day with workout tracking.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        product: prodMap['nike-air-max-270-react-flyknit']._id,
        user: customer2._id,
        rating: 4,
        title: 'Very comfortable daily sneakers with great bounce',
        comment:
          'The heel air unit provides great shock absorption. Sizing runs true to size. Looks sharp with jeans or running shorts.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        product: prodMap['apple-macbook-pro-16-m3-max']._id,
        user: customer3._id,
        rating: 5,
        title: 'Unrivaled computational power and battery endurance',
        comment:
          'Renders 8K video timelines seamlessly without the fans even kicking on. The XDR display has deep blacks and vibrant contrast. Best workstation on the market.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        product: prodMap['logitech-mx-master-3s-performance-mouse']._id,
        user: customer1._id,
        rating: 5,
        title: 'The gold standard for spreadsheet and coding productivity',
        comment:
          'The silent clicks are satisfying and the magnetic scroll wheel is addictive. Seamlessly flows between my Mac and PC workstation.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        product: prodMap['dyson-supersonic-intelligent-hair-dryer']._id,
        user: customer3._id,
        rating: 5,
        title: 'Cuts morning routine drying time in half',
        comment:
          'Gentle on fine hair without scorching heat damage. The magnetic styling attachments lock on with satisfying precision.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    ];

    for (const r of reviewsData) {
      const reviewDoc = await Review.create(r);
      await Review.calculateAverageRating(reviewDoc.product);
    }
    console.log(`Created ${reviewsData.length} Verified Customer Reviews and updated ratings.`);

    // 10. Sample Completed Orders with Full Itemization
    const sampleOrder1 = await Order.create({
      orderNumber: 'ORD-20261023-A789B',
      user: customer1._id,
      orderItems: [
        {
          product: prodMap['sony-wh-1000xm5-wireless-headphones']._id,
          title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
          image: prodMap['sony-wh-1000xm5-wireless-headphones'].images[0],
          price: 348.0,
          quantity: 1,
          sku: 'SONY-WH1000XM5-BLK',
          selectedVariant: { Color: 'Midnight Black' },
        },
        {
          product: prodMap['logitech-mx-master-3s-performance-mouse']._id,
          title: 'Logitech MX Master 3S Performance Wireless Mouse',
          image: prodMap['logitech-mx-master-3s-performance-mouse'].images[0],
          price: 89.99,
          quantity: 1,
          sku: 'LOGI-MX3S-GRY',
          selectedVariant: { Color: 'Graphite Black' },
        },
      ],
      shippingAddress: {
        fullName: sarahAddress.fullName,
        phone: sarahAddress.phone,
        streetAddress: sarahAddress.streetAddress,
        apartment: sarahAddress.apartment,
        city: sarahAddress.city,
        state: sarahAddress.state,
        postalCode: sarahAddress.postalCode,
        country: sarahAddress.country,
      },
      paymentMethod: 'Card',
      paymentStatus: 'Completed',
      itemsPrice: 437.99,
      shippingPrice: 0.0, // Free shipping threshold met
      taxPrice: 37.23,
      discountAmount: 50.0, // Used coupon NOVAFIRST
      totalPrice: 425.22,
      coupon: {
        code: 'NOVAFIRST',
        discountAmount: 50.0,
        discountType: 'percentage',
      },
      orderStatus: 'Delivered',
      isPaid: true,
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isDelivered: true,
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      carrier: 'FedEx Express',
      trackingNumber: 'FDX-8823491823',
      statusHistory: [
        { status: 'Confirmed', note: 'Order placed & payment verified', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'Processing', note: 'Assigned to logistics facility', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000) },
        { status: 'Packed', note: 'Boxed with tamper-evident seal', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'Shipped', note: 'Dispatched via FedEx priority transit', timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) },
        { status: 'Delivered', note: 'Package signed for by customer', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    });

    const sampleOrder2 = await Order.create({
      orderNumber: 'ORD-20261023-C412X',
      user: customer2._id,
      orderItems: [
        {
          product: prodMap['nike-air-max-270-react-flyknit']._id,
          title: 'Nike Air Max 270 React Flyknit Sneakers',
          image: prodMap['nike-air-max-270-react-flyknit'].images[0],
          price: 129.99,
          quantity: 2,
          sku: 'NIKE-AM270-RED',
          selectedVariant: { Size: 'US 10', Color: 'University Red' },
        },
      ],
      shippingAddress: {
        fullName: 'Alex Rivers',
        phone: '+1 555-0178',
        streetAddress: '450 Mission Street',
        apartment: 'Suite 1200',
        city: 'San Francisco',
        state: 'California',
        postalCode: '94105',
        country: 'United States',
      },
      paymentMethod: 'PayPal',
      paymentStatus: 'Completed',
      itemsPrice: 259.98,
      shippingPrice: 0.0,
      taxPrice: 22.1,
      discountAmount: 0.0,
      totalPrice: 282.08,
      orderStatus: 'Shipped',
      isPaid: true,
      paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      carrier: 'UPS Ground',
      trackingNumber: '1Z9999999999999999',
      statusHistory: [
        { status: 'Confirmed', note: 'PayPal invoice verified', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'Processing', note: 'Allocated from SF distribution hub', timestamp: new Date(Date.now() - 0.7 * 24 * 60 * 60 * 1000) },
        { status: 'Shipped', note: 'En route with carrier driver', timestamp: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000) },
      ],
    });

    console.log('Created Sample Orders.');

    // 11. Customer Shopping Cart & Wishlist
    await Cart.create({
      user: customer1._id,
      items: [
        {
          product: prodMap['apple-watch-series-9-gps-45mm']._id,
          quantity: 1,
          price: 379.0,
          selectedVariant: { Color: 'Midnight', 'Band Size': 'M/L' },
        },
      ],
      coupon: coupons[0]._id,
    });

    await Wishlist.create({
      user: customer1._id,
      products: [
        prodMap['sony-alpha-7-iv-full-frame-camera']._id,
        prodMap['dyson-airwrap-multi-styler-complete']._id,
      ],
    });

    // 12. Operational Notifications
    await Notification.create([
      {
        user: null,
        title: 'New High-Value Order Placed',
        message: `Order #${sampleOrder1.orderNumber} for $${sampleOrder1.totalPrice.toFixed(2)} was placed by ${customer1.name}.`,
        type: 'order',
        link: `/admin/orders/${sampleOrder1._id}`,
        isRead: false,
      },
      {
        user: null,
        title: 'Low Stock Threshold Warning',
        message: `MacBook Pro 16" (M3 Max) is nearing depleted inventory (${prodMap['apple-macbook-pro-16-m3-max'].stock} units left).`,
        type: 'inventory',
        link: '/admin/inventory',
        isRead: false,
      },
      {
        user: customer1._id,
        title: 'Shipment Out for Delivery',
        message: `Your package with tracking number ${sampleOrder1.trackingNumber} has been delivered!`,
        type: 'order',
        link: `/orders/${sampleOrder1._id}`,
        isRead: true,
      },
    ]);

    console.log('Created Customer Carts, Wishlists, and Live Notifications.');

    console.log('\n======================================================');
    console.log('✅ DATABASE ARCHITECTURE SEED COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(`Admin User:      admin@ecommerce.com / Admin123!`);
    console.log(`Customer User:   customer@ecommerce.com / Customer123!`);
    console.log(`Customer 2:      alex.rivers@ecommerce.com / Customer123!`);
    console.log(`Customer 3:      elena.rostova@ecommerce.com / Customer123!`);
    console.log(`Categories:      ${categories.length}`);
    console.log(`Brands:          ${brands.length}`);
    console.log(`Products:        ${products.length} (Exceeds requirement of 20)`);
    console.log(`Coupons:         ${coupons.length}`);
    console.log(`Reviews:         ${reviewsData.length}`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed with error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
