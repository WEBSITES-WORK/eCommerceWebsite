import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Normalizes Supabase relational records to match frontend expectations seamlessly.
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
 * Direct Supabase database handler for Catalog queries (categories, brands, products, images, variants)
 */
export const handleSupabaseCatalog = async (config) => {
  if (!isSupabaseConfigured) return null;
  const rawUrl = config.url || '';
  const url = rawUrl.replace(/^\/api/, '');
  const method = (config.method || 'get').toLowerCase();

  if (method !== 'get') return null;

  try {
    // 1. Categories List
    if (url === '/categories' || url.startsWith('/categories?')) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        return {
          success: true,
          data: data.map((c) => ({ ...c, _id: c.id })),
        };
      }
    }

    // 2. Categories Single Item (by slug)
    if (url.startsWith('/categories/') && !url.includes('?')) {
      const slug = url.replace('/categories/', '');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
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
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (!error && data) {
        return {
          success: true,
          data: data.map((b) => ({ ...b, _id: b.id })),
        };
      }
    }

    // 4. Brands Single Item (by slug)
    if (url.startsWith('/brands/') && !url.includes('?')) {
      const slug = url.replace('/brands/', '');
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
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
    if (url.startsWith('/products/') && !url.includes('?')) {
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
      const params = fullUrl.searchParams;
      const page = parseInt(params.get('page')) || 1;
      const limit = parseInt(params.get('limit')) || 12;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('products')
        .select(`
          *,
          categories (*),
          brands (*),
          product_images (*),
          product_variants (*)
        `, { count: 'exact' })
        .eq('is_active', true);

      // Category filter (UUID or slug)
      const catParam = params.get('category');
      if (catParam) {
        const isCatUuid = /^[0-9a-fA-F-]{36}$/.test(catParam);
        if (isCatUuid) {
          query = query.eq('category_id', catParam);
        } else {
          // Resolve category slug
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

      // Brand filter (UUID or slug)
      const brandParam = params.get('brand');
      if (brandParam) {
        const isBrandUuid = /^[0-9a-fA-F-]{36}$/.test(brandParam);
        if (isBrandUuid) {
          query = query.eq('brand_id', brandParam);
        } else {
          // Resolve brand slug
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

      if (params.get('isFeatured') === 'true') {
        query = query.eq('is_featured', true);
      }
      if (params.get('isBestseller') === 'true') {
        query = query.eq('is_bestseller', true);
      }
      if (params.get('isNewArrival') === 'true') {
        query = query.eq('is_new_arrival', true);
      }

      const keyword = params.get('keyword') || params.get('query');
      if (keyword) {
        query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }
      if (params.get('minPrice')) {
        query = query.gte('price', parseFloat(params.get('minPrice')));
      }
      if (params.get('maxPrice')) {
        query = query.lte('price', parseFloat(params.get('maxPrice')));
      }
      if (params.get('inStock') === 'true') {
        query = query.gt('stock_quantity', 0);
      }

      // Sorting
      const sort = params.get('sort');
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
        .select('*')
        .eq('product_id', prodId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return {
          success: true,
          data: data.map((r) => ({
            ...r,
            _id: r.id,
            user: { name: r.title || 'Verified Customer' },
          })),
        };
      }
      return { success: true, data: [] };
    }

    // 9. Store Settings
    if (url === '/settings' || url.startsWith('/settings?')) {
      return {
        success: true,
        data: {
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
        },
      };
    }
  } catch (err) {
    console.warn('[Supabase Catalog Handler Error]:', err);
  }

  return null;
};

// Custom Axios Adapter: Route all Catalog GET requests directly to Supabase
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);
api.defaults.adapter = async (config) => {
  if (isSupabaseConfigured && (config.method || 'get').toLowerCase() === 'get') {
    const supabaseResult = await handleSupabaseCatalog(config);
    if (supabaseResult) {
      return {
        data: supabaseResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    }
  }
  return defaultAdapter(config);
};

// Response interceptor to handle unauthorized and network fallbacks
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Secondary fallback in case of adapter bypass
    if (isSupabaseConfigured && error.config) {
      const fallbackResult = await handleSupabaseCatalog(error.config);
      if (fallbackResult) {
        return fallbackResult;
      }
    }

    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
