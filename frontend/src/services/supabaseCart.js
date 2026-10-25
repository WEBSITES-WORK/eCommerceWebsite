import { supabase, isSupabaseConfigured } from './supabase';
import { normalizeProduct } from './supabaseCatalog';

const COUPON_STORAGE_KEY = 'novashop_cart_coupon';

export const getAppliedCoupon = () => {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAppliedCoupon = (coupon) => {
  try {
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  } catch {
    // Ignore storage issues
  }
};

/**
 * Builds formatted cart response with items and recalculated totals
 */
export const buildCartResponse = async (userId) => {
  const { data: rawItems, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      variant_id,
      product_id,
      products (
        *,
        categories (*),
        brands (*),
        product_images (*),
        product_variants (*)
      ),
      product_variants (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const items = (rawItems || []).map((ci) => {
    const product = normalizeProduct(ci.products);
    const pv = ci.product_variants;

    let price = product.discountPrice > 0 ? product.discountPrice : product.price;
    if (pv) {
      price = Number(pv.sale_price || pv.price || price);
    }

    let selectedVariant = {};
    if (pv && pv.option_values && typeof pv.option_values === 'object') {
      selectedVariant = pv.option_values;
    }

    return {
      _id: ci.id,
      id: ci.id,
      product,
      quantity: ci.quantity,
      selectedVariant,
      price: Number(price),
      totalPrice: Number(price) * ci.quantity,
    };
  });

  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);

  // Validate applied coupon against live subtotal
  let coupon = getAppliedCoupon();
  let discountAmount = 0;

  if (coupon && coupon.code && subtotal > 0) {
    const { data: valRes } = await supabase.rpc('validate_coupon', {
      p_code: coupon.code,
      p_subtotal: subtotal,
    });

    if (valRes && valRes.valid) {
      discountAmount = Number(valRes.discount || 0);
      coupon = {
        code: valRes.code,
        discountType: valRes.discount_type,
        discountAmount,
        description: valRes.description,
      };
    } else {
      setAppliedCoupon(null);
      coupon = null;
    }
  } else {
    setAppliedCoupon(null);
    coupon = null;
  }

  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const freeShippingThreshold = 99.0;
  const shippingPrice = subtotal > 0 && netSubtotal < freeShippingThreshold ? 15.0 : 0.0;
  const taxPrice = 0.0;
  const totalPrice = netSubtotal + shippingPrice + taxPrice;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - netSubtotal);

  const totals = {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    shippingPrice: Number(shippingPrice.toFixed(2)),
    taxPrice: Number(taxPrice.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
    freeShippingThreshold,
    amountToFreeShipping: Number(amountToFreeShipping.toFixed(2)),
  };

  return {
    success: true,
    data: {
      items,
      coupon,
      totals,
    },
  };
};

/**
 * Handles all cart-related REST calls using Supabase
 */
export const handleCartRequest = async (url, method, body) => {
  if (!isSupabaseConfigured) return null;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      message: 'Please sign in to access your cart',
      data: { items: [], coupon: null, totals: { subtotal: 0, totalPrice: 0 } },
    };
  }

  // 1. GET /cart
  if ((url === '/cart' || url === '/cart/') && method === 'get') {
    return await buildCartResponse(userId);
  }

  // 2. POST /cart (Add to cart)
  if ((url === '/cart' || url === '/cart/') && method === 'post') {
    const { productId, quantity = 1, selectedVariant = {} } = body || {};
    if (!productId) {
      throw new Error('Product ID is required');
    }

    // Try to match selected variant if provided
    let variantId = null;
    if (selectedVariant && Object.keys(selectedVariant).length > 0) {
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, option_values')
        .eq('product_id', productId)
        .eq('is_active', true);

      if (variants && variants.length > 0) {
        // Compare option_values
        const match = variants.find((v) => {
          if (!v.option_values || typeof v.option_values !== 'object') return false;
          return Object.entries(selectedVariant).every(
            ([k, val]) => v.option_values[k] === val || v.option_values[k.toLowerCase()] === val
          );
        });
        if (match) variantId = match.id;
        else variantId = variants[0].id;
      }
    }

    // Check existing item
    let query = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    } else {
      query = query.is('variant_id', null);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: userId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      });
    }

    return await buildCartResponse(userId);
  }

  // 3. PUT /cart/items/:id (Update quantity)
  if (url.startsWith('/cart/items/') && method === 'put') {
    const itemId = url.replace('/cart/items/', '').split('?')[0];
    const qty = parseInt(body?.quantity) || 0;

    if (qty <= 0) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('cart_items')
        .update({
          quantity: qty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('user_id', userId);
    }

    return await buildCartResponse(userId);
  }

  // 4. DELETE /cart/items/:id (Remove item)
  if (url.startsWith('/cart/items/') && method === 'delete') {
    const itemId = url.replace('/cart/items/', '').split('?')[0];
    await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    return await buildCartResponse(userId);
  }

  // 5. POST /cart/coupon (Apply Coupon)
  if (url === '/cart/coupon' && method === 'post') {
    const code = (body?.code || '').trim();
    if (!code) {
      throw new Error('Please enter a coupon code');
    }

    // Get current cart subtotal
    const cart = await buildCartResponse(userId);
    const subtotal = cart.data.totals.subtotal;

    const { data: valRes, error } = await supabase.rpc('validate_coupon', {
      p_code: code,
      p_subtotal: subtotal,
    });

    if (error || !valRes?.valid) {
      throw new Error(valRes?.message || error?.message || 'Invalid coupon code');
    }

    setAppliedCoupon({
      code: valRes.code,
      discountType: valRes.discount_type,
      discountAmount: Number(valRes.discount || 0),
      description: valRes.description,
    });

    const updated = await buildCartResponse(userId);
    return {
      success: true,
      message: `Coupon "${valRes.code}" applied successfully! Saved $${valRes.discount}`,
      data: updated.data,
    };
  }

  // 6. DELETE /cart/coupon (Remove Coupon)
  if (url === '/cart/coupon' && method === 'delete') {
    setAppliedCoupon(null);
    const updated = await buildCartResponse(userId);
    return {
      success: true,
      message: 'Coupon removed',
      data: updated.data,
    };
  }

  // 7. DELETE /cart (Clear cart)
  if (url === '/cart' && method === 'delete') {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    setAppliedCoupon(null);
    return await buildCartResponse(userId);
  }

  return null;
};
