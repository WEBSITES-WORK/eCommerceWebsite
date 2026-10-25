-- 3. PRODUCTS
INSERT INTO public.products (
  id,
  name,
  slug,
  sku,
  description,
  short_description,
  category_id,
  brand_id,
  price,
  sale_price,
  stock_quantity,
  low_stock_threshold,
  weight,
  is_active,
  is_featured,
  is_bestseller,
  is_new_arrival,
  meta_title,
  meta_description
) VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    'sony-wh-1000xm5-wireless-headphones',
    'SONY-WH1000XM5-BLK',
    'Industry-leading active noise canceling with two processors and eight microphones. Exceptional sound quality engineered to perfection with High-Resolution Audio support and crystal-clear hands-free calling.

Specifications:
• Battery Life: 30 Hours (ANC On)
• Connectivity: Bluetooth 5.2, 3.5mm AUX
• Weight: 250 grams
• Noise Cancellation: Dual Processor QN1 + V1

Tags: audio, bluetooth, noise cancelling, sony, headphones',
    'Industry-leading active noise canceling with two processors and eight microphones. Exceptional sound quality engineered to perfection with High-Resolution Au...',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    399.99,
    348,
    35,
    5,
    0.250,
    true,
    true,
    true,
    false,
    'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    'Industry-leading active noise canceling with two processors and eight microphones. Exceptional sound quality engineered to perfection with High-Resolution Au...'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'Apple Watch Series 9 GPS 45mm Aluminum Case',
    'apple-watch-series-9-gps-45mm',
    'APL-W9-45M',
    'Smarter, brighter, and mightier. Powered by the S9 SiP with Double Tap gesture control, a magically bright 2000-nit Always-On display, and precision iPhone finding.

Specifications:
• Display: Always-On Retina OLED (2000 nits)
• Processor: Apple S9 SiP
• Water Resistance: 50m Swimproof

Tags: smartwatch, apple, fitness, wearables, heart rate',
    'Smarter, brighter, and mightier. Powered by the S9 SiP with Double Tap gesture control, a magically bright 2000-nit Always-On display, and precision iPhone f...',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    429,
    379,
    22,
    4,
    NULL,
    true,
    true,
    true,
    true,
    'Apple Watch Series 9 GPS 45mm Aluminum Case',
    'Smarter, brighter, and mightier. Powered by the S9 SiP with Double Tap gesture control, a magically bright 2000-nit Always-On display, and precision iPhone f...'
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'Nike Air Max 270 React Flyknit Sneakers',
    'nike-air-max-270-react-flyknit',
    'NIKE-AM270-RED',
    'Nike''s biggest heel Air unit yet delivers ultra-soft cushioning that feels as impossible as it looks. The lightweight Flyknit upper hugs your foot for an effortless run or casual daily wear.

Specifications:
• Cushioning: React Foam + Max Air 270 Heel Unit
• Upper Material: Breathable Flyknit Fabric
• Gender: Unisex

Tags: shoes, sneakers, nike, running, streetwear',
    'Nike''s biggest heel Air unit yet delivers ultra-soft cushioning that feels as impossible as it looks. The lightweight Flyknit upper hugs your foot for an eff...',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    160,
    129.99,
    45,
    8,
    NULL,
    true,
    true,
    true,
    false,
    'Nike Air Max 270 React Flyknit Sneakers',
    'Nike''s biggest heel Air unit yet delivers ultra-soft cushioning that feels as impossible as it looks. The lightweight Flyknit upper hugs your foot for an eff...'
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'Samsung Galaxy S24 Ultra 5G (512GB Titanium)',
    'samsung-galaxy-s24-ultra-5g-512gb',
    'SAM-S24U-512',
    'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Integrated S Pen, 200MP camera system, and Galaxy AI built right in.

Specifications:
• Processor: Snapdragon 8 Gen 3 for Galaxy
• Storage: 512GB UFS 4.0
• Main Camera: 200 MP Quad Telephoto
• Battery: 5,000 mAh Fast Charging

Tags: smartphone, samsung, 5g, galaxy ai, android',
    'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Integrated S Pen, 200MP camera system, and...',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000004',
    1399,
    1249,
    14,
    3,
    NULL,
    true,
    true,
    false,
    true,
    'Samsung Galaxy S24 Ultra 5G (512GB Titanium)',
    'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Integrated S Pen, 200MP camera system, and...'
  ),
  (
    'e0000000-0000-0000-0000-000000000005',
    'Dyson Supersonic™ Intelligent Hair Dryer',
    'dyson-supersonic-intelligent-hair-dryer',
    'DYS-SUPER-V2',
    'Engineered for different hair types, fast drying with no extreme heat. Powered by the small, powerful Dyson digital motor V9 combined with Air Multiplier™ technology.

Specifications:
• Motor: Dyson V9 digital motor
• Heat Settings: 4 precise heat settings
• Attachments: Flyaway attachment, Styling concentrator

Tags: haircare, dyson, beauty, styling',
    'Engineered for different hair types, fast drying with no extreme heat. Powered by the small, powerful Dyson digital motor V9 combined with Air Multiplier™ te...',
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000005',
    429.99,
    399,
    18,
    4,
    NULL,
    true,
    false,
    true,
    true,
    'Dyson Supersonic™ Intelligent Hair Dryer',
    'Engineered for different hair types, fast drying with no extreme heat. Powered by the small, powerful Dyson digital motor V9 combined with Air Multiplier™ te...'
  ),
  (
    'e0000000-0000-0000-0000-000000000006',
    'Ergonomic Mesh Executive Desk Chair',
    'ergonomic-mesh-executive-desk-chair',
    'HOME-CHAIR-ERG',
    'High back breathable mesh chair with 3D adjustable armrests, dynamic lumbar support, and smooth multi-angle reclining mechanism for all-day posture comfort.

Specifications:
• Max Weight Capacity: 300 lbs
• Material: High-density breathable Korean mesh
• Warranty: 5 Years

Tags: furniture, office, ergonomic, chair',
    'High back breathable mesh chair with 3D adjustable armrests, dynamic lumbar support, and smooth multi-angle reclining mechanism for all-day posture comfort.',
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000006',
    289,
    229,
    16,
    5,
    136.078,
    true,
    true,
    false,
    true,
    'Ergonomic Mesh Executive Desk Chair',
    'High back breathable mesh chair with 3D adjustable armrests, dynamic lumbar support, and smooth multi-angle reclining mechanism for all-day posture comfort.'
  ),
  (
    'e0000000-0000-0000-0000-000000000007',
    'Pro Aerobic High-Tension Resistance Bands Kit',
    'pro-aerobic-resistance-bands-kit',
    'SPT-BAND-SET',
    'Set of 5 stackable resistance tubes ranging from 10 to 50 lbs (up to 150 lbs combined) with door anchor, cushioned handles, and ankle straps.

Specifications:
• Material: 100% Natural Malaysian Latex
• Tension Range: 10 lbs to 150 lbs combined

Tags: fitness, workout, gym, sports',
    'Set of 5 stackable resistance tubes ranging from 10 to 50 lbs (up to 150 lbs combined) with door anchor, cushioned handles, and ankle straps.',
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000003',
    49.99,
    34.99,
    60,
    10,
    NULL,
    true,
    false,
    true,
    false,
    'Pro Aerobic High-Tension Resistance Bands Kit',
    'Set of 5 stackable resistance tubes ranging from 10 to 50 lbs (up to 150 lbs combined) with door anchor, cushioned handles, and ankle straps.'
  ),
  (
    'e0000000-0000-0000-0000-000000000008',
    'Minimalist Matte Ceramic Dinnerware Set (16-Piece)',
    'minimalist-matte-ceramic-dinnerware-set',
    'KIT-CER-16P',
    'Service for 4 crafted from durable stoneware with modern organic rims and a scratch-resistant satin matte finish. Microwave and dishwasher safe.

Specifications:
• Pieces: 4 Dinner plates, 4 Salad plates, 4 Bowls, 4 Mugs
• Safety: BPA-Free, Lead-Free, Dishwasher Safe

Tags: kitchen, home, dinnerware, plates',
    'Service for 4 crafted from durable stoneware with modern organic rims and a scratch-resistant satin matte finish. Microwave and dishwasher safe.',
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    139,
    109,
    28,
    5,
    NULL,
    true,
    false,
    false,
    true,
    'Minimalist Matte Ceramic Dinnerware Set (16-Piece)',
    'Service for 4 crafted from durable stoneware with modern organic rims and a scratch-resistant satin matte finish. Microwave and dishwasher safe.'
  ),
  (
    'e0000000-0000-0000-0000-000000000009',
    'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)',
    'apple-macbook-pro-16-m3-max',
    'APL-MBP16-M3M',
    'Supercharged by M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness and up to 22 hours of battery life.

Specifications:
• Chip: Apple M3 Max
• Memory: 36GB Unified Memory
• Display: 16.2-inch Liquid Retina XDR (120Hz ProMotion)
• Storage: 1TB Superfast NVMe SSD

Tags: laptop, macbook, apple, m3 max, pro computer',
    'Supercharged by M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness and up to 22 hours of battery life.',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    3499,
    3199,
    8,
    2,
    NULL,
    true,
    true,
    true,
    true,
    'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)',
    'Supercharged by M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness and up to 22 hours of battery life.'
  ),
  (
    'e0000000-0000-0000-0000-000000000010',
    'Logitech MX Master 3S Performance Wireless Mouse',
    'logitech-mx-master-3s-performance-mouse',
    'LOGI-MX3S-GRY',
    'Quiet Clicks with 8000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling wheel that scrolls 1,000 lines in a single second with pinpoint tactile precision.

Specifications:
• Sensor: Darkfield 8000 DPI High Precision
• Battery: Up to 70 days per charge (USB-C)
• Connectivity: Bluetooth Low Energy & Logi Bolt

Tags: mouse, logitech, productivity, bluetooth, workspace',
    'Quiet Clicks with 8000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling wheel that scrolls 1,000 lines in a single second with pinpoint tactile ...',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    99.99,
    89.99,
    55,
    8,
    NULL,
    true,
    false,
    true,
    false,
    'Logitech MX Master 3S Performance Wireless Mouse',
    'Quiet Clicks with 8000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling wheel that scrolls 1,000 lines in a single second with pinpoint tactile ...'
  ),
  (
    'e0000000-0000-0000-0000-000000000011',
    'Adidas Ultraboost Light Running Shoes',
    'adidas-ultraboost-light-running-shoes',
    'ADI-UB-LIGHT',
    'Experience epic energy return with the lightest BOOST technology ever made. Continental™ Better Rubber outsole for superior wet and dry grip.

Specifications:
• Midsole: Light BOOST Foam
• Outsole: Continental™ Rubber

Tags: shoes, sneakers, adidas, ultraboost, running',
    'Experience epic energy return with the lightest BOOST technology ever made. Continental™ Better Rubber outsole for superior wet and dry grip.',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000007',
    190,
    149,
    32,
    6,
    NULL,
    true,
    false,
    true,
    true,
    'Adidas Ultraboost Light Running Shoes',
    'Experience epic energy return with the lightest BOOST technology ever made. Continental™ Better Rubber outsole for superior wet and dry grip.'
  ),
  (
    'e0000000-0000-0000-0000-000000000012',
    'Dyson V15 Detect™ Absolute Cordless Vacuum',
    'dyson-v15-detect-absolute-vacuum',
    'DYS-V15-ABS',
    'Laser illumination reveals microscopic dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically increasing suction when needed.

Specifications:
• Suction Power: 240 Air Watts
• Run Time: Up to 60 Minutes
• Filtration: Whole-machine HEPA filtration

Tags: vacuum, dyson, cleaning, home appliance, cordless',
    'Laser illumination reveals microscopic dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically increasing suction when ...',
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000005',
    749.99,
    649.99,
    10,
    3,
    NULL,
    true,
    true,
    false,
    true,
    'Dyson V15 Detect™ Absolute Cordless Vacuum',
    'Laser illumination reveals microscopic dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically increasing suction when ...'
  ),
  (
    'e0000000-0000-0000-0000-000000000013',
    'Sony PlayStation 5 Slim Console (1TB SSD)',
    'sony-playstation-5-slim-console',
    'SONY-PS5-SLIM',
    'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.

Specifications:
• Storage: 1TB Custom NVMe SSD
• Resolution: 4K 120Hz, 8K Output Support
• Audio: Tempest 3D AudioTech

Tags: gaming, ps5, playstation, sony, console',
    'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    499.99,
    479.99,
    15,
    4,
    NULL,
    true,
    true,
    true,
    false,
    'Sony PlayStation 5 Slim Console (1TB SSD)',
    'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.'
  ),
  (
    'e0000000-0000-0000-0000-000000000014',
    'Samsung 34" Odyssey OLED G8 Curved Gaming Monitor',
    'samsung-34-odyssey-oled-g8-curved-monitor',
    'SAM-MON-G8',
    'Stunning Neo Quantum Processor delivers brighter whites, deeper blacks, and near infinite color contrast. Lightning fast 0.03ms response time with 175Hz refresh rate.

Specifications:
• Screen Size: 34 Inch Curved (1800R)
• Panel Type: QD-OLED (3440 x 1440)
• Refresh Rate: 175Hz
• Response Time: 0.03ms (GtG)

Tags: monitor, gaming, oled, samsung, curved display',
    'Stunning Neo Quantum Processor delivers brighter whites, deeper blacks, and near infinite color contrast. Lightning fast 0.03ms response time with 175Hz refr...',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000004',
    1199.99,
    999,
    7,
    2,
    NULL,
    true,
    true,
    false,
    true,
    'Samsung 34" Odyssey OLED G8 Curved Gaming Monitor',
    'Stunning Neo Quantum Processor delivers brighter whites, deeper blacks, and near infinite color contrast. Lightning fast 0.03ms response time with 175Hz refr...'
  ),
  (
    'e0000000-0000-0000-0000-000000000015',
    'Logitech MX Mechanical Wireless Illuminated Keyboard',
    'logitech-mx-mechanical-keyboard',
    'LOGI-MX-MECH',
    'Low-profile mechanical switches for next-level typing feel. Smart backlighting automatically illuminates when hands approach and adjusts to ambient light.

Specifications:
• Switch Type: Tactile Quiet Mechanical
• Battery: Up to 15 days (with backlight) or 10 months (off)

Tags: keyboard, mechanical, logitech, typing, workspace',
    'Low-profile mechanical switches for next-level typing feel. Smart backlighting automatically illuminates when hands approach and adjusts to ambient light.',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    169.99,
    149.99,
    24,
    5,
    NULL,
    true,
    false,
    true,
    false,
    'Logitech MX Mechanical Wireless Illuminated Keyboard',
    'Low-profile mechanical switches for next-level typing feel. Smart backlighting automatically illuminates when hands approach and adjusts to ambient light.'
  ),
  (
    'e0000000-0000-0000-0000-000000000016',
    'Nike Sportswear Tech Fleece Full-Zip Windrunner',
    'nike-sportswear-tech-fleece-full-zip',
    'NIKE-TF-HOOD',
    'Our premium lightweight fleece is smooth both inside and out, giving you plenty of warmth without adding bulk. Tailored athletic silhouette.

Specifications:
• Material: 53% Cotton / 47% Polyester
• Care: Machine Washable

Tags: hoodie, apparel, nike, tech fleece, streetwear',
    'Our premium lightweight fleece is smooth both inside and out, giving you plenty of warmth without adding bulk. Tailored athletic silhouette.',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    145,
    119,
    38,
    6,
    NULL,
    true,
    false,
    true,
    true,
    'Nike Sportswear Tech Fleece Full-Zip Windrunner',
    'Our premium lightweight fleece is smooth both inside and out, giving you plenty of warmth without adding bulk. Tailored athletic silhouette.'
  ),
  (
    'e0000000-0000-0000-0000-000000000017',
    'Adidas Tiro 23 League Athletic Training Track Pants',
    'adidas-tiro-23-league-track-pants',
    'ADI-TIRO-PNT',
    'Born on the soccer pitch, styled for the streets. Moisture-absorbing AEROREADY keeps you dry, while ankle zips make for quick on and off over footwear.

Specifications:
• Technology: AEROREADY Moisture Wicking
• Fit: Slim athletic tapered fit

Tags: pants, adidas, track pants, sports, athleisure',
    'Born on the soccer pitch, styled for the streets. Moisture-absorbing AEROREADY keeps you dry, while ankle zips make for quick on and off over footwear.',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000007',
    55,
    44,
    50,
    8,
    NULL,
    true,
    false,
    false,
    false,
    'Adidas Tiro 23 League Athletic Training Track Pants',
    'Born on the soccer pitch, styled for the streets. Moisture-absorbing AEROREADY keeps you dry, while ankle zips make for quick on and off over footwear.'
  ),
  (
    'e0000000-0000-0000-0000-000000000018',
    'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
    'apple-airpods-pro-2nd-gen-usbc',
    'APL-APP2-USBC',
    'Up to 2x more Active Noise Cancellation, Adaptive Audio that tailors noise control to your environment, and Personalized Spatial Audio with dynamic head tracking.

Specifications:
• Chip: Apple H2 Headphone Chip
• Case: MagSafe USB-C with Speaker & Lanyard Loop
• Battery: Up to 6 hours listening (30 hrs with case)

Tags: airpods, apple, earbuds, anc, wireless audio',
    'Up to 2x more Active Noise Cancellation, Adaptive Audio that tailors noise control to your environment, and Personalized Spatial Audio with dynamic head trac...',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    249,
    199,
    40,
    5,
    NULL,
    true,
    true,
    true,
    false,
    'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
    'Up to 2x more Active Noise Cancellation, Adaptive Audio that tailors noise control to your environment, and Personalized Spatial Audio with dynamic head trac...'
  ),
  (
    'e0000000-0000-0000-0000-000000000019',
    'Dyson Airwrap™ Multi-Styler Complete Long',
    'dyson-airwrap-multi-styler-complete',
    'DYS-AIRWRAP-LNG',
    'Style with air, not extreme heat. Harnesses the aerodynamic Coanda effect to curl, shape, and hide flyaways using precise airflow controls.

Specifications:
• Airflow Speed: 3 precise airflow speeds
• Attachments: 6 styling attachments + storage case

Tags: hair styling, dyson, airwrap, beauty, curler',
    'Style with air, not extreme heat. Harnesses the aerodynamic Coanda effect to curl, shape, and hide flyaways using precise airflow controls.',
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000005',
    599.99,
    549.99,
    12,
    3,
    NULL,
    true,
    true,
    true,
    true,
    'Dyson Airwrap™ Multi-Styler Complete Long',
    'Style with air, not extreme heat. Harnesses the aerodynamic Coanda effect to curl, shape, and hide flyaways using precise airflow controls.'
  ),
  (
    'e0000000-0000-0000-0000-000000000020',
    'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
    'sony-alpha-7-iv-full-frame-camera',
    'SONY-A7M4-BODY',
    '33MP full-frame Exmor R back-illuminated CMOS sensor. 4K 60p 10-bit 4:2:2 video recording with cinematic S-Cinetone color profile and next-gen real-time tracking autofocus.

Specifications:
• Sensor: 33 MP Full-Frame Exmor R CMOS
• Video Resolution: 4K 60p 10-Bit 4:2:2
• Autofocus: 759 phase-detection AF points

Tags: camera, sony, mirrorless, photography, 4k video',
    '33MP full-frame Exmor R back-illuminated CMOS sensor. 4K 60p 10-bit 4:2:2 video recording with cinematic S-Cinetone color profile and next-gen real-time trac...',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    2499.99,
    2298,
    9,
    2,
    NULL,
    true,
    true,
    false,
    false,
    'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
    '33MP full-frame Exmor R back-illuminated CMOS sensor. 4K 60p 10-bit 4:2:2 video recording with cinematic S-Cinetone color profile and next-gen real-time trac...'
  ),
  (
    'e0000000-0000-0000-0000-000000000021',
    'Hydro Pure Double-Wall Insulated Steel Flask (32oz)',
    'hydro-pure-double-wall-insulated-flask',
    'SPT-FLASK-32OZ',
    'Keeps beverages ice cold for 24 hours or piping hot for 12 hours. Pro-grade 18/8 stainless steel with powder-coated sweat-proof exterior and leak-proof flex chug cap.

Specifications:
• Capacity: 32 oz (946 ml)
• Material: 18/8 Pro-Grade Stainless Steel

Tags: water bottle, fitness, sports, hydration, insulated',
    'Keeps beverages ice cold for 24 hours or piping hot for 12 hours. Pro-grade 18/8 stainless steel with powder-coated sweat-proof exterior and leak-proof flex ...',
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000003',
    39.99,
    29.99,
    65,
    10,
    NULL,
    true,
    false,
    true,
    false,
    'Hydro Pure Double-Wall Insulated Steel Flask (32oz)',
    'Keeps beverages ice cold for 24 hours or piping hot for 12 hours. Pro-grade 18/8 stainless steel with powder-coated sweat-proof exterior and leak-proof flex ...'
  ),
  (
    'e0000000-0000-0000-0000-000000000022',
    'Logitech Brio 4K Ultra HD Streaming & Conference Webcam',
    'logitech-brio-4k-ultra-hd-webcam',
    'LOGI-BRIO-4K',
    'Ultra 4K HD video calling with RightLight 3 and HDR technology that automatically balances exposure in direct sunlight or dim light. Windows Hello facial recognition built-in.

Specifications:
• Resolution: 4K Ultra HD @ 30fps / 1080p @ 60fps
• Field of View: Adjustable 65°, 78°, and 90°
• Microphones: Dual omni-directional noise canceling

Tags: webcam, 4k, logitech, streaming, remote work',
    'Ultra 4K HD video calling with RightLight 3 and HDR technology that automatically balances exposure in direct sunlight or dim light. Windows Hello facial rec...',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    199.99,
    159.99,
    26,
    4,
    NULL,
    true,
    false,
    false,
    true,
    'Logitech Brio 4K Ultra HD Streaming & Conference Webcam',
    'Ultra 4K HD video calling with RightLight 3 and HDR technology that automatically balances exposure in direct sunlight or dim light. Windows Hello facial rec...'
  )
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  category_id = EXCLUDED.category_id,
  brand_id = EXCLUDED.brand_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  weight = EXCLUDED.weight,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  is_bestseller = EXCLUDED.is_bestseller,
  is_new_arrival = EXCLUDED.is_new_arrival,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;