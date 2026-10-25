import { supabase, isSupabaseConfigured } from './supabase';
import { normalizeProduct } from './supabaseCatalog';

/**
 * Handles Wishlist, Addresses, Notifications, Reviews, Coupons, and Users with Supabase
 */
export const handleUserFeaturesRequest = async (url, method, body, params = {}) => {
  if (!isSupabaseConfigured) return null;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // =========================================================================
  // 1. WISHLIST
  // =========================================================================
  if (url === '/wishlist' && method === 'get') {
    if (!userId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        created_at,
        products (
          *,
          categories (*),
          brands (*),
          product_images (*),
          product_variants (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const products = (data || [])
      .map((w) => normalizeProduct(w.products))
      .filter(Boolean);

    return { success: true, data: products };
  }

  if (url === '/wishlist/toggle' && method === 'post') {
    if (!userId) throw new Error('Please sign in to save items to your wishlist');
    const productId = body?.productId;
    if (!productId) throw new Error('Product ID required');

    // Check if exists
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    let isWishlisted = false;
    let message = '';

    if (existing) {
      await supabase.from('wishlist_items').delete().eq('id', existing.id);
      isWishlisted = false;
      message = 'Item removed from wishlist';
    } else {
      await supabase.from('wishlist_items').insert({
        user_id: userId,
        product_id: productId,
      });
      isWishlisted = true;
      message = 'Item added to wishlist! ❤️';
    }

    // Return current wishlist products
    const { data: all } = await supabase
      .from('wishlist_items')
      .select(`
        products (
          *,
          categories (*),
          brands (*),
          product_images (*),
          product_variants (*)
        )
      `)
      .eq('user_id', userId);

    const products = (all || []).map((w) => normalizeProduct(w.products)).filter(Boolean);

    return {
      success: true,
      message,
      data: {
        isWishlisted,
        products,
      },
    };
  }

  // =========================================================================
  // 2. ADDRESSES
  // =========================================================================
  const formatAddress = (addr) => ({
    _id: addr.id,
    id: addr.id,
    fullName: addr.full_name,
    phone: addr.phone,
    streetAddress: addr.address_line1,
    apartment: addr.address_line2 || '',
    city: addr.city,
    state: addr.state || '',
    postalCode: addr.postal_code || '',
    country: addr.country || 'United States',
    isDefault: Boolean(addr.is_default),
    createdAt: addr.created_at,
  });

  if ((url === '/addresses' || url === '/addresses/') && method === 'get') {
    if (!userId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: (data || []).map(formatAddress) };
  }

  if ((url === '/addresses' || url === '/addresses/') && method === 'post') {
    if (!userId) throw new Error('Authentication required');

    const isDef = Boolean(body?.isDefault);
    if (isDef) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        full_name: body?.fullName || '',
        phone: body?.phone || '',
        address_line1: body?.streetAddress || '',
        address_line2: body?.apartment || '',
        city: body?.city || '',
        state: body?.state || '',
        postal_code: body?.postalCode || '',
        country: body?.country || 'United States',
        is_default: isDef,
      })
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data: formatAddress(data) };
  }

  if (url.startsWith('/addresses/') && url.includes('/default') && (method === 'patch' || method === 'put')) {
    const addrId = url.split('/')[2];
    if (!userId) throw new Error('Authentication required');

    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', addrId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data: formatAddress(data) };
  }

  if (url.startsWith('/addresses/') && method === 'put') {
    const addrId = url.replace('/addresses/', '').split('?')[0];
    if (!userId) throw new Error('Authentication required');

    const isDef = Boolean(body?.isDefault);
    if (isDef) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        full_name: body?.fullName,
        phone: body?.phone,
        address_line1: body?.streetAddress,
        address_line2: body?.apartment,
        city: body?.city,
        state: body?.state,
        postal_code: body?.postalCode,
        country: body?.country,
        is_default: isDef,
        updated_at: new Date().toISOString(),
      })
      .eq('id', addrId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data: formatAddress(data) };
  }

  if (url.startsWith('/addresses/') && method === 'delete') {
    const addrId = url.replace('/addresses/', '').split('?')[0];
    if (!userId) throw new Error('Authentication required');

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addrId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, message: 'Address removed successfully' };
  }

  // =========================================================================
  // 3. NOTIFICATIONS
  // =========================================================================
  if ((url === '/notifications' || url === '/notifications/') && method === 'get') {
    if (!userId) return { success: true, data: { notifications: [], unreadCount: 0 } };

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const notifications = (data || []).map((n) => ({
      _id: n.id,
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'general',
      isRead: Boolean(n.is_read),
      link: n.link || '',
      createdAt: n.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    };
  }

  if (url.includes('/notifications/read-all') && (method === 'patch' || method === 'put')) {
    if (!userId) return { success: true };
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    return { success: true, message: 'All notifications marked as read' };
  }

  if (url.startsWith('/notifications/') && url.includes('/read') && (method === 'patch' || method === 'put')) {
    const notifId = url.split('/')[2];
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    return { success: true, message: 'Notification marked as read' };
  }

  // =========================================================================
  // 4. REVIEWS
  // =========================================================================
  if (url === '/reviews' && method === 'post') {
    if (!userId) throw new Error('Please sign in to write a review');

    const { productId, rating, title, comment } = body || {};
    if (!productId || !rating) throw new Error('Product and rating are required');

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
        title: title || '',
        comment: comment || '',
        is_approved: true, // Auto-approved for verified purchases
      })
      .select('*, profiles(name, avatar)')
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: {
        ...data,
        _id: data.id,
        user: { name: data.profiles?.name || 'Verified Customer' },
      },
    };
  }

  // Admin: GET /reviews
  if ((url === '/reviews' || url.startsWith('/reviews?')) && method === 'get' && !url.includes('/product/')) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products (id, name, slug),
        profiles (id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((r) => ({
        _id: r.id,
        id: r.id,
        product: r.products
          ? { _id: r.products.id, title: r.products.name, slug: r.products.slug }
          : { title: 'Unknown Product' },
        user: r.profiles
          ? { _id: r.profiles.id, name: r.profiles.name, email: r.profiles.email }
          : { name: 'Customer' },
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isApproved: Boolean(r.is_approved),
        createdAt: r.created_at,
      })),
    };
  }

  // Admin: PATCH /reviews/:id/approval
  if (url.startsWith('/reviews/') && url.includes('/approval') && (method === 'patch' || method === 'put')) {
    const revId = url.split('/')[2];
    const { data: rev } = await supabase.from('reviews').select('is_approved').eq('id', revId).single();
    const newStatus = !rev?.is_approved;

    const { data, error } = await supabase
      .from('reviews')
      .update({ is_approved: newStatus, updated_at: new Date().toISOString() })
      .eq('id', revId)
      .select('*')
      .single();

    if (error) throw error;
    return {
      success: true,
      message: `Review ${newStatus ? 'approved' : 'hidden'} successfully`,
      data,
    };
  }

  // Admin: DELETE /reviews/:id
  if (url.startsWith('/reviews/') && method === 'delete') {
    const revId = url.replace('/reviews/', '').split('?')[0];
    const { error } = await supabase.from('reviews').delete().eq('id', revId);
    if (error) throw error;
    return { success: true, message: 'Review deleted successfully' };
  }

  // =========================================================================
  // 5. COUPONS
  // =========================================================================
  if (url === '/coupons/validate' && method === 'post') {
    const { code, cartTotal = 0 } = body || {};
    const { data: valRes, error } = await supabase.rpc('validate_coupon', {
      p_code: code,
      p_subtotal: parseFloat(cartTotal) || 0,
    });

    if (error || !valRes?.valid) {
      throw new Error(valRes?.message || error?.message || 'Invalid coupon code');
    }

    return {
      success: true,
      data: valRes,
    };
  }

  // Admin: GET /coupons
  if ((url === '/coupons' || url.startsWith('/coupons?')) && method === 'get') {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((c) => ({
        _id: c.id,
        id: c.id,
        code: c.code,
        description: c.description,
        discountType: c.discount_type,
        discountAmount: Number(c.discount_value),
        minOrderAmount: Number(c.minimum_order_amount),
        maxDiscountAmount: c.maximum_discount_amount ? Number(c.maximum_discount_amount) : null,
        usageLimit: c.usage_limit,
        usedCount: c.usage_count,
        userUsageLimit: c.per_user_limit,
        expiryDate: c.expires_at,
        isActive: Boolean(c.is_active),
        createdAt: c.created_at,
      })),
    };
  }

  // Admin: POST /coupons
  if ((url === '/coupons' || url === '/coupons/') && method === 'post') {
    const {
      code,
      discountType = 'percentage',
      discountAmount,
      minOrderAmount = 0,
      maxDiscountAmount = null,
      expiryDate,
      usageLimit = null,
      userUsageLimit = 1,
      isActive = true,
      description = '',
    } = body || {};

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.trim().toUpperCase(),
        description: description || '',
        discount_type: discountType,
        discount_value: parseFloat(discountAmount) || 0,
        minimum_order_amount: parseFloat(minOrderAmount) || 0,
        maximum_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        per_user_limit: userUsageLimit ? parseInt(userUsageLimit) : 1,
        expires_at: expiryDate || null,
        is_active: Boolean(isActive),
      })
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, message: 'Coupon created successfully', data };
  }

  // Admin: PUT /coupons/:id
  if (url.startsWith('/coupons/') && method === 'put') {
    const couponId = url.replace('/coupons/', '').split('?')[0];
    const {
      code,
      discountType,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      userUsageLimit,
      isActive,
      description,
    } = body || {};

    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (code) updates.code = code.trim().toUpperCase();
    if (description !== undefined) updates.description = description;
    if (discountType) updates.discount_type = discountType;
    if (discountAmount !== undefined) updates.discount_value = parseFloat(discountAmount);
    if (minOrderAmount !== undefined) updates.minimum_order_amount = parseFloat(minOrderAmount);
    if (maxDiscountAmount !== undefined) updates.maximum_discount_amount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    if (usageLimit !== undefined) updates.usage_limit = usageLimit ? parseInt(usageLimit) : null;
    if (userUsageLimit !== undefined) updates.per_user_limit = parseInt(userUsageLimit) || 1;
    if (expiryDate !== undefined) updates.expires_at = expiryDate;
    if (isActive !== undefined) updates.is_active = Boolean(isActive);

    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', couponId)
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, message: 'Coupon updated successfully', data };
  }

  // Admin: DELETE /coupons/:id
  if (url.startsWith('/coupons/') && method === 'delete') {
    const couponId = url.replace('/coupons/', '').split('?')[0];
    const { error } = await supabase.from('coupons').delete().eq('id', couponId);
    if (error) throw error;
    return { success: true, message: 'Coupon deleted successfully' };
  }

  // =========================================================================
  // 6. USERS & PROFILES
  // =========================================================================
  // Admin: GET /auth/users
  if (url.startsWith('/auth/users') && method === 'get') {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const search = params.search || new URL(`http://localhost${url}`).searchParams.get('search');
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((u) => ({
        _id: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        isBlocked: Boolean(u.is_blocked),
        createdAt: u.created_at,
      })),
    };
  }

  // Admin: PUT /auth/users/:id (Update role or block)
  if (url.startsWith('/auth/users/') && method === 'put') {
    const targetUserId = url.replace('/auth/users/', '').split('?')[0];
    const updates = { updated_at: new Date().toISOString() };

    if (body?.role) updates.role = body.role;
    if (body?.isBlocked !== undefined) updates.is_blocked = Boolean(body.isBlocked);

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', targetUserId)
      .select('*')
      .single();

    if (error) throw error;
    return {
      success: true,
      message: 'User profile updated successfully',
      data: {
        ...data,
        _id: data.id,
        isBlocked: Boolean(data.is_blocked),
      },
    };
  }

  // Customer: GET /auth/me
  if (url === '/auth/me' && method === 'get') {
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) throw new Error('Profile not found');

    return {
      success: true,
      data: {
        _id: data.id,
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role,
        isBlocked: Boolean(data.is_blocked),
      },
    };
  }

  // Customer: PUT /auth/profile
  if (url === '/auth/profile' && method === 'put') {
    if (!userId) throw new Error('Not authenticated');

    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (body?.name !== undefined) updates.name = body.name.trim();
    if (body?.phone !== undefined) updates.phone = body.phone.trim();
    if (body?.avatar !== undefined) updates.avatar = body.avatar;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;

    await supabase.auth.updateUser({
      data: {
        name: updates.name,
        phone: updates.phone,
        avatar: updates.avatar,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: { ...data, _id: data.id },
    };
  }

  // Customer: PUT /auth/change-password
  if (url === '/auth/change-password' && method === 'put') {
    if (!userId || !session?.user?.email) throw new Error('Not authenticated');

    const { currentPassword, newPassword } = body || {};
    if (!currentPassword || !newPassword) {
      throw new Error('Please provide current and new passwords');
    }

    // Verify current password
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });
    if (verifyErr) {
      throw new Error('Current password is incorrect');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  return null;
};
