const path = require('path');
const { createClient } = require(path.join(__dirname, '../frontend/node_modules/@supabase/supabase-js'));

const supabaseUrl = 'https://dkvennczilsiugwfelzw.supabase.co';
const supabaseKey = 'sb_publishable_8FczYWZL5ffvTPNLoIJghw_LLjQoxl_';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('====================================================');
  console.log('NOVASHOP SUPABASE PRODUCTION VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`TEST: ${name} ... `);
    try {
      await fn();
      console.log('PASSED ✅');
      passed++;
    } catch (err) {
      console.log(`FAILED ❌ -> ${err.message}`);
      failed++;
    }
  }

  // 1. Categories
  await test('Public Categories Query', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No categories found');
    if (data.length < 6) throw new Error(`Expected at least 6 categories, got ${data.length}`);
  });

  // 2. Brands
  await test('Public Brands Query', async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug')
      .eq('is_active', true);
    if (error) throw error;
    if (!data || data.length < 7) throw new Error(`Expected at least 7 brands, got ${data?.length}`);
  });

  // 3. Products + Images + Variants
  await test('Public Products with Images & Variants Query', async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, slug, price, sale_price, stock_quantity,
        categories (id, name),
        brands (id, name),
        product_images (id, image_url),
        product_variants (id, name, price, stock_quantity, option_values)
      `)
      .eq('is_active', true);
    if (error) throw error;
    if (!data || data.length < 22) throw new Error(`Expected 22 products, got ${data?.length}`);

    // Check relations
    const withImages = data.filter(p => p.product_images && p.product_images.length > 0);
    const withVariants = data.filter(p => p.product_variants && p.product_variants.length > 0);
    if (withImages.length === 0) throw new Error('No products have product_images attached');
    if (withVariants.length === 0) throw new Error('No products have product_variants attached');
  });

  // 4. Coupons Validation RPC
  await test('Coupon Validation RPC (NOVAFIRST 15% off $100)', async () => {
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: 'NOVAFIRST',
      p_subtotal: 100,
    });
    if (error) throw error;
    if (!data || !data.valid) throw new Error(data?.message || 'Coupon marked invalid');
    if (data.discount !== 15) throw new Error(`Expected discount of $15, got $${data.discount}`);
  });

  // 5. Coupon Below Minimum
  await test('Coupon Minimum Order Check (SAVE20 min $100 rejected on $40 order)', async () => {
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: 'SAVE20',
      p_subtotal: 40,
    });
    if (error) throw error;
    if (data && data.valid) throw new Error('SAVE20 should have been rejected below $100 subtotal');
  });

  // 6. RLS Security: Anonymous User Blocked from Profiles
  await test('RLS Security: Anon client blocked from selecting profiles', async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (data && data.length > 0) throw new Error('RLS Breach! Anon was able to read customer profiles');
  });

  // 7. RLS Security: Anonymous User Blocked from Orders
  await test('RLS Security: Anon client blocked from reading orders', async () => {
    const { data } = await supabase.from('orders').select('*');
    if (data && data.length > 0) throw new Error('RLS Breach! Anon was able to read orders');
  });

  // 8. RLS Security: Anonymous User Blocked from Addresses
  await test('RLS Security: Anon client blocked from reading addresses', async () => {
    const { data } = await supabase.from('addresses').select('*');
    if (data && data.length > 0) throw new Error('RLS Breach! Anon was able to read addresses');
  });

  // 9. Storage Buckets Public Access
  await test('Storage Public URL Access for Product Images', async () => {
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl('test-sample.jpg');
    if (!data || !data.publicUrl.includes('supabase.co/storage/v1/object/public/product-images')) {
      throw new Error(`Invalid public storage URL: ${data?.publicUrl}`);
    }
  });

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');
}

runTests();
