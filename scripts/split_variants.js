const fs = require('fs');
const path = require('path');

const fullSql = fs.readFileSync(path.join(__dirname, 'seed_product_variants.sql'), 'utf8');

const prefix = `INSERT INTO public.product_variants (
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
) VALUES\n`;

const onConflict = `\nON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  option_values = EXCLUDED.option_values,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;`;

// Extract all value tuples: split by "  (\n"
const parts = fullSql.split(/\n  \(\n/);
const header = parts[0];
const tuples = parts.slice(1).map((t, idx, arr) => {
  if (idx === arr.length - 1) {
    // remove ON CONFLICT ...
    const confIdx = t.indexOf('\nON CONFLICT');
    return '  (\n' + (confIdx !== -1 ? t.slice(0, confIdx) : t);
  }
  return '  (\n' + t.replace(/,\s*$/, '');
});

console.log('Total tuples:', tuples.length);

const half = Math.ceil(tuples.length / 2);
const part1Tuples = tuples.slice(0, half).join(',\n');
const part2Tuples = tuples.slice(half).join(',\n');

fs.writeFileSync(path.join(__dirname, 'seed_variants_part1.sql'), prefix + part1Tuples + onConflict);
fs.writeFileSync(path.join(__dirname, 'seed_variants_part2.sql'), prefix + part2Tuples + onConflict);

console.log(`Part 1: ${half} variants`);
console.log(`Part 2: ${tuples.length - half} variants`);
