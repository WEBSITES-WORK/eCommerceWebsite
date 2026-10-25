const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dkvennczilsiugwfelzw.supabase.co';
const supabaseKey = 'sb_publishable_8FczYWZL5ffvTPNLoIJghw_LLjQoxl_';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing Supabase public queries...');

  // 1. Categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (catError) {
    console.error('Category error:', catError);
  } else {
    console.log(`✅ Categories retrieved: ${categories.length}`);
  }

  // 2. Brands
  const { data: brands, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (brandError) {
    console.error('Brand error:', brandError);
  } else {
    console.log(`✅ Brands retrieved: ${brands.length}`);
  }

  // 3. Products with relations
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      product_images(*),
      product_variants(*)
    `)
    .eq('is_active', true)
    .limit(3);

  if (prodError) {
    console.error('Products error:', prodError);
  } else {
    console.log(`✅ Products retrieved: ${products.length}`);
    const p = products[0];
    console.log(`Sample product: ${p.name}`);
    console.log(`Category: ${p.category ? p.category.name : 'none'}`);
    console.log(`Brand: ${p.brand ? p.brand.name : 'none'}`);
    console.log(`Images: ${p.product_images ? p.product_images.length : 0}`);
    console.log(`Variants: ${p.product_variants ? p.product_variants.length : 0}`);
    if (p.product_variants && p.product_variants.length > 0) {
      console.log('Sample variant option_values:', p.product_variants[0].option_values);
    }
  }
}

testQuery();
