import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Normalizes Supabase relational product records to match frontend expectations seamlessly.
 */
export const normalizeProduct = (p) => {
  if (!p) return null;

  // 1. Process Product Images
  let images = [];
  if (Array.isArray(p.product_images) && p.product_images.length > 0) {
    images = p.product_images
      .slice()
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((img) => img.image_url)
      .filter(Boolean);
  } else if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images;
  }
  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];
  }

  // 2. Process Product Variants into selector groups
  let variants = [];
  if (Array.isArray(p.product_variants) && p.product_variants.length > 0) {
    const optionMap = {};
    p.product_variants.forEach((pv) => {
      if (pv.option_values && typeof pv.option_values === 'object') {
        Object.entries(pv.option_values).forEach(([rawKey, val]) => {
          const keyName = rawKey
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          if (!optionMap[keyName]) optionMap[keyName] = new Set();
          if (val) optionMap[keyName].add(val);
        });
      }
    });

    variants = Object.entries(optionMap).map(([name, optSet]) => ({
      name,
      options: Array.from(optSet),
    }));
  } else if (Array.isArray(p.variants)) {
    variants = p.variants;
  }

  // 3. Parse Specifications and Clean Description
  let specifications = [];
  let cleanDescription = p.description || '';
  if (p.description && p.description.includes('Specifications:')) {
    const [descPart, specPart] = p.description.split('Specifications:');
    cleanDescription = descPart.trim();
    if (specPart) {
      const specText = specPart.split('Tags:')[0];
      specifications = specText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('•'))
        .map((line) => {
          const cleaned = line.replace(/^•\s*/, '');
          const colonIdx = cleaned.indexOf(':');
          if (colonIdx !== -1) {
            return {
              key: cleaned.slice(0, colonIdx).trim(),
              value: cleaned.slice(colonIdx + 1).trim(),
            };
          }
          return { key: 'Feature', value: cleaned };
        });
    }
  } else if (Array.isArray(p.specifications)) {
    specifications = p.specifications;
  }

  // 4. Resolve Brand and Category relations
  const category = p.categories
    ? { ...p.categories, _id: p.categories.id }
    : p.category && typeof p.category === 'object'
    ? { ...p.category, _id: p.category.id || p.category._id }
    : p.category_id
    ? { _id: p.category_id, name: '' }
    : null;

  const brand = p.brands
    ? { ...p.brands, _id: p.brands.id }
    : p.brand && typeof p.brand === 'object'
    ? { ...p.brand, _id: p.brand.id || p.brand._id }
    : p.brand_id
    ? { _id: p.brand_id, name: '' }
    : null;

  const price = Number(p.price || 0);
  const discountPrice =
    p.sale_price !== null && p.sale_price !== undefined
      ? Number(p.sale_price)
      : p.discount_price !== undefined
      ? Number(p.discount_price)
      : Number(p.discountPrice || 0);

  const stock =
    p.stock_quantity !== undefined
      ? Number(p.stock_quantity)
      : p.stock !== undefined
      ? Number(p.stock)
      : 0;

  return {
    ...p,
    id: p.id || p._id,
    _id: p.id || p._id,
    title: p.name || p.title,
    name: p.name || p.title,
    slug: p.slug,
    sku: p.sku,
    description: cleanDescription || p.description,
    fullDescription: p.description,
    short_description: p.short_description || cleanDescription.slice(0, 160),
    price,
    discountPrice,
    sale_price: discountPrice > 0 ? discountPrice : null,
    stock,
    stock_quantity: stock,
    lowStockThreshold: p.low_stock_threshold || 5,
    weight: p.weight,
    isFeatured: p.is_featured !== undefined ? p.is_featured : p.isFeatured,
    isBestseller: p.is_bestseller !== undefined ? p.is_bestseller : p.isBestseller,
    isNewArrival: p.is_new_arrival !== undefined ? p.is_new_arrival : p.isNewArrival,
    isActive: p.is_active !== undefined ? p.is_active : p.isActive,
    rating: Number(p.rating || 4.8),
    numReviews: Number(p.reviews_count || p.numReviews || 12),
    reviewsCount: Number(p.reviews_count || p.numReviews || 12),
    metaTitle: p.meta_title || p.name || p.title,
    metaDescription: p.meta_description || p.short_description,
    category,
    brand,
    images,
    product_images: p.product_images || [],
    variants,
    product_variants: p.product_variants || [],
    specifications,
  };
};

/**
 * Handles catalog and store settings queries with Supabase
 */
export const handleCatalogRequest = async (url, method, params = {}) => {
  if (!isSupabaseConfigured || method !== 'get') return null;

  // 1. Categories List
  if (url === '/categories' || url.startsWith('/categories?')) {
    let query = supabase.from('categories').select('*');
    if (!url.includes('all=true')) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('sort_order', { ascending: true });

    if (!error && data) {
      return {
        success: true,
        data: data.map((c) => ({ ...c, _id: c.id })),
      };
    }
  }

  // 2. Categories Single Item (by slug or UUID)
  if (url.startsWith('/categories/') && !url.includes('?')) {
    const slugOrId = url.replace('/categories/', '');
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(slugOrId);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq(isUuid ? 'id' : 'slug', slugOrId)
      .single();

    if (!error && data) {
      return {
        success: true,
        data: { ...data, _id: data.id },
      };
    }
  }

  // 3. Brands List
  if (url === '/brands' || url.startsWith('/brands?')) {
    let query = supabase.from('brands').select('*');
    if (!url.includes('all=true')) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('name', { ascending: true });

    if (!error && data) {
      return {
        success: true,
        data: data.map((b) => ({ ...b, _id: b.id })),
      };
    }
  }

  // 4. Brands Single Item (by slug or UUID)
  if (url.startsWith('/brands/') && !url.includes('?')) {
    const slugOrId = url.replace('/brands/', '');
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(slugOrId);

    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq(isUuid ? 'id' : 'slug', slugOrId)
      .single();

    if (!error && data) {
      return {
        success: true,
        data: { ...data, _id: data.id },
      };
    }
  }

  // 5. Related Products
  if (url.includes('/related')) {
    const prodIdOrSlug = url.split('/')[2];
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(prodIdOrSlug);

    const { data: targetProduct } = await supabase
      .from('products')
      .select('id, category_id')
      .eq(isUuid ? 'id' : 'slug', prodIdOrSlug)
      .maybeSingle();

    if (targetProduct) {
      const { data: related, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (*),
          brands (*),
          product_images (*),
          product_variants (*)
        `)
        .eq('category_id', targetProduct.category_id)
        .neq('id', targetProduct.id)
        .eq('is_active', true)
        .limit(4);

      if (!error && related) {
        return {
          success: true,
          data: related.map(normalizeProduct),
        };
      }
    }
    return { success: true, data: [] };
  }

  // 6. Single Product Details (by UUID or slug)
  if (url.startsWith('/products/') && !url.includes('?') && !url.includes('/inventory') && !url.includes('/status')) {
    const slugOrId = url.replace('/products/', '');
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(slugOrId);

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (*),
        brands (*),
        product_images (*),
        product_variants (*)
      `)
      .eq(isUuid ? 'id' : 'slug', slugOrId)
      .single();

    if (!error && data) {
      return {
        success: true,
        data: normalizeProduct(data),
      };
    }
  }

  // 7. Products List & Search / Filters
  if (url === '/products' || url.startsWith('/products?')) {
    const fullUrl = new URL(`http://localhost${url}`);
    const searchParams = fullUrl.searchParams;
    const page = parseInt(searchParams.get('page') || params.page) || 1;
    const limit = parseInt(searchParams.get('limit') || params.limit) || 12;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories (*),
        brands (*),
        product_images (*),
        product_variants (*)
      `, { count: 'exact' });

    // Show only active unless admin or all=true
    if (!searchParams.get('all') && params.all !== 'true' && params.all !== true) {
      query = query.eq('is_active', true);
    }

    // Category filter
    const catParam = searchParams.get('category') || params.category;
    if (catParam) {
      const isCatUuid = /^[0-9a-fA-F-]{36}$/.test(catParam);
      if (isCatUuid) {
        query = query.eq('category_id', catParam);
      } else {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', catParam)
          .maybeSingle();
        if (catData) {
          query = query.eq('category_id', catData.id);
        }
      }
    }

    // Brand filter
    const brandParam = searchParams.get('brand') || params.brand;
    if (brandParam) {
      const isBrandUuid = /^[0-9a-fA-F-]{36}$/.test(brandParam);
      if (isBrandUuid) {
        query = query.eq('brand_id', brandParam);
      } else {
        const { data: brandData } = await supabase
          .from('brands')
          .select('id')
          .eq('slug', brandParam)
          .maybeSingle();
        if (brandData) {
          query = query.eq('brand_id', brandData.id);
        }
      }
    }

    if (searchParams.get('isFeatured') === 'true' || params.isFeatured === true) {
      query = query.eq('is_featured', true);
    }
    if (searchParams.get('isBestseller') === 'true' || params.isBestseller === true) {
      query = query.eq('is_bestseller', true);
    }
    if (searchParams.get('isNewArrival') === 'true' || params.isNewArrival === true) {
      query = query.eq('is_new_arrival', true);
    }

    const keyword = searchParams.get('keyword') || searchParams.get('query') || params.keyword;
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%,sku.ilike.%${keyword}%`);
    }

    const minPrice = searchParams.get('minPrice') || params.minPrice;
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    const maxPrice = searchParams.get('maxPrice') || params.maxPrice;
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (searchParams.get('inStock') === 'true' || params.inStock === true) {
      query = query.gt('stock_quantity', 0);
    }

    // Sorting
    const sort = searchParams.get('sort') || params.sort;
    if (sort === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-high') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (!error && data) {
      const normalized = data.map(normalizeProduct);
      const totalCount = count !== null ? count : normalized.length;
      return {
        success: true,
        data: {
          products: normalized,
          total: totalCount,
          pages: Math.ceil(totalCount / limit) || 1,
          page,
        },
      };
    }
  }

  // 8. Reviews by Product
  if (url.startsWith('/reviews/product/')) {
    const prodIdOrSlug = url.replace('/reviews/product/', '');
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(prodIdOrSlug);
    let prodId = prodIdOrSlug;

    if (!isUuid) {
      const { data: p } = await supabase
        .from('products')
        .select('id')
        .eq('slug', prodIdOrSlug)
        .maybeSingle();
      if (p) prodId = p.id;
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(name, avatar)')
      .eq('product_id', prodId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return {
        success: true,
        data: data.map((r) => ({
          ...r,
          _id: r.id,
          user: {
            name: r.profiles?.name || r.title || 'Verified Customer',
            avatar: r.profiles?.avatar || '',
          },
        })),
      };
    }
    return { success: true, data: [] };
  }

  // 9. Store Settings
  if (url === '/settings' || url.startsWith('/settings?') || url === '/admin/settings') {
    return {
      success: true,
      data: {
        storeName: 'NovaShop',
        storeEmail: 'support@novashop.com',
        storePhone: '+1 (800) 555-0199',
        address: '100 Market Street, Suite 400, San Francisco, CA 94105',
        currency: 'USD',
        currencySymbol: '$',
        taxRate: 0.0,
        shippingFee: 15.0,
        freeShippingThreshold: 99.0,
        announcementBar: '✨ Free express shipping on orders over $99! Use coupon NOVAFIRST for 15% off.',
        showAnnouncement: true,
      },
    };
  }

  return null;
};
