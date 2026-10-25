import { supabase, isSupabaseConfigured } from './supabase';
import { setAppliedCoupon } from './supabaseCart';

/**
 * Formats database order row to match frontend shape seamlessly
 */
export const formatOrder = (ord) => {
  if (!ord) return null;

  const rawItems = ord.order_items || [];
  const orderItems = rawItems.map((oi) => ({
    _id: oi.id,
    id: oi.id,
    product: oi.product_id,
    productId: oi.product_id,
    title: oi.product_name,
    name: oi.product_name,
    sku: oi.sku,
    image: oi.image_url,
    imageUrl: oi.image_url,
    price: Number(oi.unit_price || 0),
    quantity: oi.quantity,
    subtotal: Number(oi.subtotal || 0),
  }));

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Pending');

  return {
    ...ord,
    _id: ord.id,
    id: ord.id,
    orderNumber: ord.order_number,
    orderStatus: capitalize(ord.status),
    status: ord.status,
    paymentMethod: ord.payment_method || 'cash_on_delivery',
    paymentStatus: ord.payment_status || 'pending',
    subtotal: Number(ord.subtotal || 0),
    discountAmount: Number(ord.discount || 0),
    shippingPrice: Number(ord.shipping_fee || 0),
    taxPrice: Number(ord.tax || 0),
    totalPrice: Number(ord.total || 0),
    total: Number(ord.total || 0),
    createdAt: ord.created_at,
    orderItems,
    items: orderItems,
    shippingAddress: {
      fullName: ord.shipping_name || '',
      phone: ord.shipping_phone || '',
      streetAddress: ord.shipping_address || '',
      apartment: '',
      city: ord.shipping_city || '',
      state: ord.shipping_state || '',
      postalCode: ord.shipping_postal_code || '',
      country: ord.shipping_country || 'United States',
    },
    user: ord.profiles
      ? {
          _id: ord.profiles.id,
          name: ord.profiles.name,
          email: ord.profiles.email,
        }
      : undefined,
  };
};

/**
 * Handles all order & checkout operations with Supabase
 */
export const handleOrdersRequest = async (url, method, body, params = {}) => {
  if (!isSupabaseConfigured) return null;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // 1. POST /orders (Place Secure Order)
  if ((url === '/orders' || url === '/orders/') && method === 'post') {
    if (!userId) {
      throw new Error('You must be signed in to place an order');
    }

    const {
      orderItems = [],
      shippingAddress = {},
      paymentMethod = 'cash_on_delivery',
      couponCode = null,
      notes = '',
    } = body || {};

    if (!orderItems.length) {
      throw new Error('Your cart is empty. Please add items before checking out.');
    }

    // Resolve variant IDs if only selectedVariant is passed
    const secureItems = [];
    for (const it of orderItems) {
      const prodId = it.product || it.productId || it._id;
      let varId = it.variantId || it.variant_id || null;

      if (!varId && it.selectedVariant && Object.keys(it.selectedVariant).length > 0) {
        const { data: variants } = await supabase
          .from('product_variants')
          .select('id, option_values')
          .eq('product_id', prodId)
          .eq('is_active', true);

        if (variants && variants.length > 0) {
          const match = variants.find((v) => {
            if (!v.option_values || typeof v.option_values !== 'object') return false;
            return Object.entries(it.selectedVariant).every(
              ([k, val]) => v.option_values[k] === val || v.option_values[k.toLowerCase()] === val
            );
          });
          if (match) varId = match.id;
        }
      }

      secureItems.push({
        product_id: prodId,
        variant_id: varId,
        quantity: it.quantity || 1,
      });
    }

    const fullStreet = [shippingAddress.streetAddress, shippingAddress.apartment]
      .filter(Boolean)
      .join(', ');

    // Call PostgreSQL SECURITY DEFINER stored procedure
    const { data: createdOrder, error } = await supabase.rpc('create_secure_order', {
      p_shipping_name: shippingAddress.fullName || '',
      p_shipping_phone: shippingAddress.phone || '',
      p_shipping_address: fullStreet || '',
      p_shipping_city: shippingAddress.city || '',
      p_shipping_state: shippingAddress.state || '',
      p_shipping_postal_code: shippingAddress.postalCode || '',
      p_shipping_country: shippingAddress.country || 'United States',
      p_address_id: shippingAddress.address_id || null,
      p_payment_method: paymentMethod || 'cash_on_delivery',
      p_coupon_code: couponCode || null,
      p_items: secureItems,
      p_notes: notes || '',
    });

    if (error) {
      throw new Error(error.message || 'Failed to place order');
    }

    // Clear client-side stored coupon on successful order placement
    setAppliedCoupon(null);

    return {
      success: true,
      message: 'Order created successfully',
      data: formatOrder(createdOrder),
    };
  }

  // 2. GET /orders/my-orders (Customer's own orders)
  if (url === '/orders/my-orders' && method === 'get') {
    if (!userId) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map(formatOrder),
    };
  }

  // 3. GET /orders/:id (Order Details)
  if (url.startsWith('/orders/') && !url.includes('/status') && !url.includes('/cancel') && !url.includes('?')) {
    const orderIdOrNum = url.replace('/orders/', '').trim();
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(orderIdOrNum);

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles (id, name, email)
      `);

    if (isUuid) {
      query = query.eq('id', orderIdOrNum);
    } else {
      query = query.eq('order_number', orderIdOrNum);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      throw new Error('Order not found');
    }

    return {
      success: true,
      data: formatOrder(data),
    };
  }

  // 4. PATCH /orders/:id/cancel (Customer Cancelling Pending Order)
  if (url.includes('/cancel') && (method === 'patch' || method === 'put')) {
    const orderId = url.split('/')[2];
    if (!userId) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        notes: body?.reason ? `Cancelled by customer: ${body.reason}` : 'Cancelled by customer',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .select('*, order_items(*)')
      .single();

    if (error) {
      throw new Error('Unable to cancel order. Only pending orders can be cancelled.');
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
      data: formatOrder(data),
    };
  }

  // 5. GET /orders or /orders?... (Admin Order List)
  if ((url === '/orders' || url.startsWith('/orders?')) && method === 'get') {
    const fullUrl = new URL(`http://localhost${url}`);
    const sp = fullUrl.searchParams;
    const page = parseInt(sp.get('page') || params.page) || 1;
    const limit = parseInt(sp.get('limit') || params.limit) || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles (id, name, email)
      `, { count: 'exact' });

    const status = sp.get('status') || params.status;
    if (status && status !== 'all') {
      query = query.eq('status', status.toLowerCase());
    }

    const search = sp.get('search') || params.search;
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,shipping_name.ilike.%${search}%,shipping_phone.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map(formatOrder);
    const total = count !== null ? count : formatted.length;

    return {
      success: true,
      data: {
        orders: formatted,
        total,
        pages: Math.ceil(total / limit) || 1,
        page,
      },
    };
  }

  // 6. PUT /orders/:id/status (Admin Update Status)
  if (url.includes('/status') && method === 'put') {
    const orderId = url.split('/')[2];
    const newStatus = (body?.status || '').toLowerCase();
    const newPaymentStatus = body?.paymentStatus ? body.paymentStatus.toLowerCase() : null;

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (newStatus) {
      updates.status = newStatus;
      if (newStatus === 'delivered' && !newPaymentStatus) {
        updates.payment_status = 'paid';
      }
    }

    if (newPaymentStatus) {
      updates.payment_status = newPaymentStatus;
    }

    if (body?.notes) {
      updates.notes = body.notes;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select('*, order_items(*), profiles(id, name, email)')
      .single();

    if (error) throw error;

    // Send user notification when order status changes
    if (data && data.user_id && newStatus) {
      await supabase.from('notifications').insert({
        user_id: data.user_id,
        title: `Order Status: ${newStatus.toUpperCase()}`,
        message: `Your order #${data.order_number} is now marked as ${newStatus}.`,
        type: 'order',
        link: `/orders/${data.id}`,
      });
    }

    return {
      success: true,
      message: 'Order status updated successfully',
      data: formatOrder(data),
    };
  }

  return null;
};
