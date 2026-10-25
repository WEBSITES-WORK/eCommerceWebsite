const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../backend/src/utils/seedData.js'), 'utf8');

const catMatch = content.match(/const categoriesData = (\[[\s\S]*?\]);\s*const categories/);
const categoriesData = eval(catMatch[1]);

const brandMatch = content.match(/const brandsData = (\[[\s\S]*?\]);\s*const brands/);
const brandsData = eval(brandMatch[1]);

const prodMatch = content.match(/const productsData = (\[[\s\S]*?\]);\s*const products = await/);
let prodRaw = prodMatch[1]
  .replace(/catMap\['([^']+)'\]/g, '"$1"')
  .replace(/brandMap\['([^']+)'\]/g, '"$1"');
const productsData = eval(prodRaw);

console.log('Categories count:', categoriesData.length);
console.log('Brands count:', brandsData.length);
console.log('Products count:', productsData.length);

const catSlugs = new Set(categoriesData.map(c => c.slug));
const brandSlugs = new Set(brandsData.map(b => b.slug));

let totalImages = 0;
let totalVariants = 0;
const skus = new Set();
const slugs = new Set();

const allKeys = new Set();
productsData.forEach(p => Object.keys(p).forEach(k => allKeys.add(k)));
console.log('All product keys:', Array.from(allKeys));

// Check each product
productsData.forEach((p, i) => {
  console.log(`${i + 1}. [${p.sku}] ${p.title} (Slug: ${p.slug})`);
  console.log(`   Price: $${p.price}, Discount: $${p.discountPrice || 0}, Stock: ${p.stock}, Threshold: ${p.lowStockThreshold}`);
  console.log(`   Category: ${p.category}, Brand: ${p.brand}, Images: ${p.images ? p.images.length : 0}`);
  console.log(`   Featured: ${p.isFeatured}, Bestseller: ${p.isBestseller}, NewArrival: ${p.isNewArrival}`);
  if (p.variants && p.variants.length > 0) {
    console.log(`   Variants:`, JSON.stringify(p.variants));
  } else {
    console.log(`   Variants: NONE`);
  }
  if (p.specifications && p.specifications.length > 0) {
    const weightSpec = p.specifications.find(s => s.key.toLowerCase().includes('weight'));
    if (weightSpec) console.log(`   Weight Spec: ${weightSpec.value}`);
  }
});

console.log('Total images:', totalImages);
console.log('Total variant combinations:', totalVariants);

console.log('\nCategories:');
categoriesData.forEach(c => console.log(` - ${c.name} (${c.slug})`));

console.log('\nBrands:');
brandsData.forEach(b => console.log(` - ${b.name} (${b.slug})`));

console.log('\nSample Product:');
console.log(JSON.stringify(productsData[0], null, 2));
