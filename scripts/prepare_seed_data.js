const fs = require('fs');
const path = require('path');

// Read source seedData.js
const seedFile = path.join(__dirname, '../backend/src/utils/seedData.js');
const content = fs.readFileSync(seedFile, 'utf8');

// Helper to escape SQL single quotes
const escapeSql = (str) => {
  if (str === null || str === undefined) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
};

// 1. Categories
const catMatch = content.match(/const categoriesData = (\[[\s\S]*?\]);\s*const categories/);
const categoriesData = eval(catMatch[1]);

// 2. Brands
const brandMatch = content.match(/const brandsData = (\[[\s\S]*?\]);\s*const brands/);
const brandsData = eval(brandMatch[1]);

// 3. Products
const prodMatch = content.match(/const productsData = (\[[\s\S]*?\]);\s*const products = await/);
let prodRaw = prodMatch[1]
  .replace(/catMap\['([^']+)'\]/g, '"$1"')
  .replace(/brandMap\['([^']+)'\]/g, '"$1"');
const productsData = eval(prodRaw);

// Category UUID map (deterministic UUIDs v4 compatible)
const categoryMap = {
  'electronics': 'c0000000-0000-0000-0000-000000000001',
  'fashion': 'c0000000-0000-0000-0000-000000000002',
  'home-living': 'c0000000-0000-0000-0000-000000000003',
  'beauty': 'c0000000-0000-0000-0000-000000000004',
  'sports': 'c0000000-0000-0000-0000-000000000005',
  'laptops-workspace': 'c0000000-0000-0000-0000-000000000006',
};

// Brand UUID map
const brandMap = {
  'sony': 'b0000000-0000-0000-0000-000000000001',
  'apple': 'b0000000-0000-0000-0000-000000000002',
  'nike': 'b0000000-0000-0000-0000-000000000003',
  'samsung': 'b0000000-0000-0000-0000-000000000004',
  'dyson': 'b0000000-0000-0000-0000-000000000005',
  'logitech': 'b0000000-0000-0000-0000-000000000006',
  'adidas': 'b0000000-0000-0000-0000-000000000007',
};

// Product UUID map (valid hex digits: e0000000-...)
const productUuidMap = {};
productsData.forEach((p, index) => {
  const num = (index + 1).toString().padStart(4, '0');
  productUuidMap[p.sku] = `e0000000-0000-0000-0000-00000000${num}`;
});

// Cartesian product helper for variants
function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(a => curr.options.map(opt => [...a, { name: curr.name, value: opt }]));
  }, [[]]);
}

// Normalize option name to lowercase key for JSONB: "Color" -> "color", "Band Size" -> "band_size"
function normalizeOptionKey(key) {
  return key.trim().toLowerCase().replace(/\s+/g, '_');
}

// Generate a slug/sku part for variant value
function slugifyValue(val) {
  return String(val)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Data validation checks
const validationErrors = [];
const seenSkus = new Set();
const seenSlugs = new Set();

productsData.forEach((p, idx) => {
  if (!p.title) validationErrors.push(`Product index ${idx} missing title`);
  if (!p.sku) validationErrors.push(`Product "${p.title}" missing SKU`);
  if (!p.slug) validationErrors.push(`Product "${p.title}" missing slug`);
  if (p.price === undefined || p.price === null || p.price < 0) validationErrors.push(`Product "${p.title}" invalid price: ${p.price}`);
  if (p.stock === undefined || p.stock === null || p.stock < 0) validationErrors.push(`Product "${p.title}" invalid stock: ${p.stock}`);
  if (!categoryMap[p.category]) validationErrors.push(`Product "${p.title}" invalid category: ${p.category}`);
  if (!brandMap[p.brand]) validationErrors.push(`Product "${p.title}" invalid brand: ${p.brand}`);
  if (seenSkus.has(p.sku)) validationErrors.push(`Duplicate SKU detected: ${p.sku}`);
  seenSkus.add(p.sku);
  if (seenSlugs.has(p.slug)) validationErrors.push(`Duplicate slug detected: ${p.slug}`);
  seenSlugs.add(p.slug);
});

console.log('Validation errors found:', validationErrors.length);
if (validationErrors.length > 0) {
  console.error(validationErrors);
  process.exit(1);
}

// Generate Categories SQL
const categorySqlStatements = [];
categorySqlStatements.push(`-- 1. CATEGORIES`);
categorySqlStatements.push(`INSERT INTO public.categories (id, name, slug, description, image_url, image, is_active, sort_order) VALUES`);
const catValues = categoriesData.map((c, i) => {
  const id = categoryMap[c.slug];
  const sortOrder = c.displayOrder || (i + 1);
  return `  ('${id}', ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.image)}, ${escapeSql(c.image)}, true, ${sortOrder})`;
}).join(',\n');
categorySqlStatements.push(catValues);
categorySqlStatements.push(`ON CONFLICT (slug) DO UPDATE SET`);
categorySqlStatements.push(`  name = EXCLUDED.name,`);
categorySqlStatements.push(`  description = EXCLUDED.description,`);
categorySqlStatements.push(`  image_url = EXCLUDED.image_url,`);
categorySqlStatements.push(`  image = EXCLUDED.image,`);
categorySqlStatements.push(`  is_active = EXCLUDED.is_active,`);
categorySqlStatements.push(`  sort_order = EXCLUDED.sort_order;`);

// Generate Brands SQL
const brandSqlStatements = [];
brandSqlStatements.push(`-- 2. BRANDS`);
brandSqlStatements.push(`INSERT INTO public.brands (id, name, slug, description, logo_url, logo, website_url, is_active) VALUES`);
const brandValues = brandsData.map(b => {
  const id = brandMap[b.slug];
  return `  ('${id}', ${escapeSql(b.name)}, ${escapeSql(b.slug)}, ${escapeSql(b.description)}, ${escapeSql(b.logo)}, ${escapeSql(b.logo)}, ${escapeSql(b.website || '')}, true)`;
}).join(',\n');
brandSqlStatements.push(brandValues);
brandSqlStatements.push(`ON CONFLICT (slug) DO UPDATE SET`);
brandSqlStatements.push(`  name = EXCLUDED.name,`);
brandSqlStatements.push(`  description = EXCLUDED.description,`);
brandSqlStatements.push(`  logo_url = EXCLUDED.logo_url,`);
brandSqlStatements.push(`  logo = EXCLUDED.logo,`);
brandSqlStatements.push(`  website_url = EXCLUDED.website_url,`);
brandSqlStatements.push(`  is_active = EXCLUDED.is_active;`);

// Generate Products SQL
const productSqlStatements = [];
productSqlStatements.push(`-- 3. PRODUCTS`);
productSqlStatements.push(`INSERT INTO public.products (
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
) VALUES`);

const prodValues = productsData.map(p => {
  const id = productUuidMap[p.sku];
  const catId = categoryMap[p.category];
  const brandId = brandMap[p.brand];
  
  // Format description with specifications and tags so no information is lost
  let fullDescription = p.description || '';
  if (p.specifications && p.specifications.length > 0) {
    fullDescription += '\n\nSpecifications:\n' + p.specifications.map(s => `• ${s.key}: ${s.value}`).join('\n');
  }
  if (p.tags && p.tags.length > 0) {
    fullDescription += '\n\nTags: ' + p.tags.join(', ');
  }

  // Derive short description
  const shortDescription = p.description.length > 160 
    ? p.description.slice(0, 157) + '...'
    : p.description;

  const salePrice = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price)
    ? p.discountPrice
    : 'NULL';

  // Parse weight if available in specifications
  let weight = 'NULL';
  if (p.specifications) {
    const weightSpec = p.specifications.find(s => s.key.toLowerCase().includes('weight'));
    if (weightSpec) {
      const match = weightSpec.value.match(/([\d.]+)\s*(grams?|g|kg|lbs?|pounds?)/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('k')) weight = val;
        else if (unit.startsWith('g')) weight = (val / 1000).toFixed(3);
        else if (unit.startsWith('l') || unit.startsWith('p')) weight = (val * 0.453592).toFixed(3);
      }
    }
  }

  const metaTitle = p.title;
  const metaDescription = shortDescription;

  return `  (
    '${id}',
    ${escapeSql(p.title)},
    ${escapeSql(p.slug)},
    ${escapeSql(p.sku)},
    ${escapeSql(fullDescription)},
    ${escapeSql(shortDescription)},
    '${catId}',
    '${brandId}',
    ${p.price},
    ${salePrice},
    ${p.stock},
    ${p.lowStockThreshold || 5},
    ${weight},
    true,
    ${p.isFeatured ? 'true' : 'false'},
    ${p.isBestseller ? 'true' : 'false'},
    ${p.isNewArrival ? 'true' : 'false'},
    ${escapeSql(metaTitle)},
    ${escapeSql(metaDescription)}
  )`;
}).join(',\n');

productSqlStatements.push(prodValues);
productSqlStatements.push(`ON CONFLICT (sku) DO UPDATE SET`);
productSqlStatements.push(`  name = EXCLUDED.name,`);
productSqlStatements.push(`  slug = EXCLUDED.slug,`);
productSqlStatements.push(`  description = EXCLUDED.description,`);
productSqlStatements.push(`  short_description = EXCLUDED.short_description,`);
productSqlStatements.push(`  category_id = EXCLUDED.category_id,`);
productSqlStatements.push(`  brand_id = EXCLUDED.brand_id,`);
productSqlStatements.push(`  price = EXCLUDED.price,`);
productSqlStatements.push(`  sale_price = EXCLUDED.sale_price,`);
productSqlStatements.push(`  stock_quantity = EXCLUDED.stock_quantity,`);
productSqlStatements.push(`  low_stock_threshold = EXCLUDED.low_stock_threshold,`);
productSqlStatements.push(`  weight = EXCLUDED.weight,`);
productSqlStatements.push(`  is_active = EXCLUDED.is_active,`);
productSqlStatements.push(`  is_featured = EXCLUDED.is_featured,`);
productSqlStatements.push(`  is_bestseller = EXCLUDED.is_bestseller,`);
productSqlStatements.push(`  is_new_arrival = EXCLUDED.is_new_arrival,`);
productSqlStatements.push(`  meta_title = EXCLUDED.meta_title,`);
productSqlStatements.push(`  meta_description = EXCLUDED.meta_description;`);

// Generate Product Images SQL
const imageSqlStatements = [];
imageSqlStatements.push(`-- 4. PRODUCT IMAGES`);
imageSqlStatements.push(`INSERT INTO public.product_images (
  id,
  product_id,
  image_url,
  storage_path,
  alt_text,
  is_primary,
  sort_order
) VALUES`);

let imageCount = 0;
const imageValues = [];
productsData.forEach((p, pIdx) => {
  const prodId = productUuidMap[p.sku];
  const images = Array.isArray(p.images) ? p.images : [];
  images.forEach((imgUrl, imgIdx) => {
    imageCount++;
    const imgId = `f0000000-${(pIdx + 1).toString().padStart(4, '0')}-0000-0000-${(imgIdx + 1).toString().padStart(12, '0')}`;
    const altText = `${p.title} - View ${imgIdx + 1}`;
    const isPrimary = imgIdx === 0;
    imageValues.push(`  ('${imgId}', '${prodId}', ${escapeSql(imgUrl)}, '', ${escapeSql(altText)}, ${isPrimary}, ${imgIdx})`);
  });
});

imageSqlStatements.push(imageValues.join(',\n'));
imageSqlStatements.push(`ON CONFLICT (id) DO UPDATE SET`);
imageSqlStatements.push(`  image_url = EXCLUDED.image_url,`);
imageSqlStatements.push(`  alt_text = EXCLUDED.alt_text,`);
imageSqlStatements.push(`  is_primary = EXCLUDED.is_primary,`);
imageSqlStatements.push(`  sort_order = EXCLUDED.sort_order;`);

// Generate Product Variants SQL
const variantSqlStatements = [];
variantSqlStatements.push(`-- 5. PRODUCT VARIANTS`);
variantSqlStatements.push(`INSERT INTO public.product_variants (
  id,
  product_id,
  name,
  sku,
  option_values,
  price,
  sale_price,
  stock_quantity,
  image_url,
  is_active
) VALUES`);

let variantCount = 0;
const variantValues = [];
const seenVariantSkus = new Set();

productsData.forEach((p, pIdx) => {
  const prodId = productUuidMap[p.sku];
  if (!p.variants || p.variants.length === 0) {
    return; // Do NOT create fake variants
  }

  const combinations = cartesianProduct(p.variants);
  const primaryImage = (p.images && p.images.length > 0) ? p.images[0] : '';
  const salePrice = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : 'NULL';
  
  // Distribute stock evenly among variants or at least 1 unit if stock > 0
  const stockPerVariant = Math.max(1, Math.floor(p.stock / combinations.length));

  combinations.forEach((combo, cIdx) => {
    variantCount++;
    const varNum = variantCount.toString().padStart(6, '0');
    const varId = `d0000000-0000-0000-0000-000000${varNum}`;

    const optionValuesObj = {};
    const nameParts = [];
    const skuParts = [];

    combo.forEach(c => {
      const optKey = normalizeOptionKey(c.name);
      optionValuesObj[optKey] = c.value;
      nameParts.push(c.value);
      skuParts.push(slugifyValue(c.value));
    });

    const variantName = `${p.title} (${nameParts.join(', ')})`;
    let variantSku = `${p.sku}-${skuParts.join('-')}`;
    
    // Ensure uniqueness
    if (seenVariantSkus.has(variantSku)) {
      variantSku = `${variantSku}-${cIdx + 1}`;
    }
    seenVariantSkus.add(variantSku);

    const optionValuesJson = JSON.stringify(optionValuesObj).replace(/'/g, "''");

    variantValues.push(`  (
    '${varId}',
    '${prodId}',
    ${escapeSql(variantName)},
    ${escapeSql(variantSku)},
    '${optionValuesJson}'::jsonb,
    ${p.price},
    ${salePrice},
    ${stockPerVariant},
    ${escapeSql(primaryImage)},
    true
  )`);
  });
});

variantSqlStatements.push(variantValues.join(',\n'));
variantSqlStatements.push(`ON CONFLICT (sku) DO UPDATE SET`);
variantSqlStatements.push(`  name = EXCLUDED.name,`);
variantSqlStatements.push(`  option_values = EXCLUDED.option_values,`);
variantSqlStatements.push(`  price = EXCLUDED.price,`);
variantSqlStatements.push(`  sale_price = EXCLUDED.sale_price,`);
variantSqlStatements.push(`  stock_quantity = EXCLUDED.stock_quantity,`);
variantSqlStatements.push(`  image_url = EXCLUDED.image_url,`);
variantSqlStatements.push(`  is_active = EXCLUDED.is_active;`);

console.log('Categories SQL count:', categoriesData.length);
console.log('Brands SQL count:', brandsData.length);
console.log('Products SQL count:', productsData.length);
console.log('Images SQL count:', imageCount);
console.log('Variants SQL count:', variantCount);

// Save SQL outputs to files
fs.writeFileSync(path.join(__dirname, 'seed_categories.sql'), categorySqlStatements.join('\n'));
fs.writeFileSync(path.join(__dirname, 'seed_brands.sql'), brandSqlStatements.join('\n'));
fs.writeFileSync(path.join(__dirname, 'seed_products.sql'), productSqlStatements.join('\n'));
fs.writeFileSync(path.join(__dirname, 'seed_product_images.sql'), imageSqlStatements.join('\n'));
fs.writeFileSync(path.join(__dirname, 'seed_product_variants.sql'), variantSqlStatements.join('\n'));

console.log('All SQL seed files generated successfully.');
