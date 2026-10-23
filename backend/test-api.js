const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function runTests() {
  console.log('--- Starting NovaShop Backend API Audit & Verification ---');
  let passCount = 0;
  let failCount = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passCount++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.data ? `${err.status} ${JSON.stringify(err.data)}` : err.message);
      failCount++;
    }
  };

  let customerToken = '';
  let adminToken = '';
  let sampleProduct = null;
  let sampleCategory = null;

  // 1. Health Check
  await test('GET /api/health', async () => {
    const res = await request('/health');
    if (!res.success) throw new Error('Health returned false');
  });

  // 2. Auth - Customer Login
  await test('POST /api/auth/login (Customer)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'customer@ecommerce.com',
        password: 'Customer123!',
      },
    });
    if (!res.success || !res.data.token) throw new Error('Customer login failed');
    customerToken = res.data.token;
  });

  // 3. Auth - Admin Login
  await test('POST /api/auth/login (Admin)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@ecommerce.com',
        password: 'Admin123!',
      },
    });
    if (!res.success || !res.data.token) throw new Error('Admin login failed');
    adminToken = res.data.token;
  });

  // 4. Auth - Token Refresh
  await test('POST /api/auth/refresh', async () => {
    const res = await request('/auth/refresh', {
      method: 'POST',
      body: { token: customerToken },
    });
    if (!res.success || !res.data.token) throw new Error('Token refresh failed');
  });

  // 5. Auth - Get Profile
  await test('GET /api/auth/me', async () => {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!res.success || !res.data.email) throw new Error('Get profile failed');
  });

  // 6. Categories & Product Count
  await test('GET /api/categories (Enriched with productCount)', async () => {
    const res = await request('/categories');
    if (!res.success || !Array.isArray(res.data)) throw new Error('Get categories failed');
    if (res.data.length > 0) {
      sampleCategory = res.data[0];
      if (sampleCategory.productCount === undefined) throw new Error('Missing productCount field on category');
    }
  });

  // 7. Brands & Product Count
  await test('GET /api/brands (Enriched with productCount)', async () => {
    const res = await request('/brands');
    if (!res.success || !Array.isArray(res.data)) throw new Error('Get brands failed');
    if (res.data.length > 0 && res.data[0].productCount === undefined) {
      throw new Error('Missing productCount field on brand');
    }
  });

  // 8. Products - List with filtering & search
  await test('GET /api/products (Filtering, Sorting, Pagination)', async () => {
    const res = await request('/products?limit=5&sort=price-asc');
    if (!res.success || !res.data.products) throw new Error('Get products failed');
    if (res.data.products.length > 0) {
      sampleProduct = res.data.products[0];
    }
  });

  // 9. Single Product & Related Products
  await test('GET /api/products/:id & :id/related', async () => {
    if (!sampleProduct) return;
    const prodRes = await request(`/products/${sampleProduct._id}`);
    if (!prodRes.success || !prodRes.data._id) throw new Error('Get single product failed');

    const relatedRes = await request(`/products/${sampleProduct._id}/related`);
    if (!relatedRes.success || !Array.isArray(relatedRes.data)) throw new Error('Get related products failed');
  });

  // 10. Wishlist - Add, Get, Remove
  await test('Wishlist Flow (GET, POST, DELETE)', async () => {
    if (!sampleProduct) return;
    // Add to wishlist
    const addRes = await request('/wishlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { productId: sampleProduct._id },
    });
    if (!addRes.success) throw new Error('Add to wishlist failed');

    // Get wishlist
    const getRes = await request('/wishlist', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!getRes.success) throw new Error('Get wishlist failed');

    // Remove from wishlist
    const delRes = await request(`/wishlist/${sampleProduct._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!delRes.success) throw new Error('Remove from wishlist failed');
  });

  // 11. Cart Flow
  await test('Cart Flow (GET, POST, Coupon Apply/Remove, Clear)', async () => {
    if (!sampleProduct) return;
    // Clear cart first
    await request('/cart', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    // Add item
    const addRes = await request('/cart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { productId: sampleProduct._id, quantity: 1 },
    });
    if (!addRes.success || addRes.data.items.length === 0) throw new Error('Add to cart failed');

    // Apply Coupon
    const coupRes = await request('/cart/coupon', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { code: 'FLAT10' },
    });
    if (!coupRes.success) throw new Error('Coupon apply failed');

    // Remove Coupon
    const remCoup = await request('/cart/coupon', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!remCoup.success) throw new Error('Coupon remove failed');

    // Clear cart
    const clearRes = await request('/cart', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!clearRes.success) throw new Error('Clear cart failed');
  });

  // 12. Coupon Validation API
  await test('POST /api/coupons/validate', async () => {
    const res = await request('/coupons/validate', {
      method: 'POST',
      body: {
        code: 'NOVAFIRST',
        subtotal: 100,
      },
    });
    if (!res.success || res.data.discount <= 0) throw new Error('Coupon validation failed');
  });

  // 13. Admin Dashboard & Analytics
  await test('GET /api/admin/dashboard & /api/admin/analytics', async () => {
    const dashRes = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!dashRes.success || !dashRes.data.summary) throw new Error('Dashboard stats failed');

    const analyticsRes = await request('/admin/analytics?range=30d', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!analyticsRes.success || !analyticsRes.data.summary) throw new Error('Analytics failed');
  });

  // 14. Admin User Management
  await test('GET /api/auth/users (Admin)', async () => {
    const res = await request('/auth/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.success || !Array.isArray(res.data.users)) throw new Error('Get all users failed');
  });

  // 15. Customer Orders
  await test('GET /api/orders/my-orders (Customer)', async () => {
    const res = await request('/orders/my-orders', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!res.success || !Array.isArray(res.data)) throw new Error('My orders failed');
  });

  console.log(`\n========================================`);
  console.log(`Audit Summary: ${passCount} Passed, ${failCount} Failed`);
  console.log(`========================================\n`);

  if (failCount > 0) process.exit(1);
}

runTests();
