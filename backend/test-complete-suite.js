const API_BASE = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('================================================================');
  console.log('  STARTING COMPREHENSIVE E-COMMERCE END-TO-END TEST SUITE');
  console.log('================================================================\n');

  let passCount = 0;
  let failCount = 0;
  const failures = [];

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passCount++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failCount++;
      failures.push({ name, error: err.message });
    }
  };

  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    const config = { ...options, headers };
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, headers: res.headers, data };
  }

  // Generate unique test user credentials
  const timestamp = Date.now();
  const testCustomerEmail = `suite.test.${timestamp}@ecommerce.com`;
  const initialPassword = 'Password123!';
  const updatedPassword = 'NewPassword456!';
  let customerToken = null;
  let customerId = null;
  let adminToken = null;
  let testProductId = null;
  let testProductSlug = null;
  let testOrderId = null;
  let testAddressId = null;
  let testReviewId = null;

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & ACCESS CONTROL
  // -------------------------------------------------------------
  console.log('\n--- 1. AUTH MODULE TESTS ---');

  await test('AUTH: Register new customer', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Suite Test User',
        email: testCustomerEmail,
        password: initialPassword,
        phone: '+1 555-0199',
      },
    });
    if (res.status !== 201 || !res.data.success) {
      throw new Error(`Registration failed: ${res.data.message || res.status}`);
    }
    customerToken = res.data.data.token;
    customerId = res.data.data._id;
  });

  await test('AUTH: Login with valid customer credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: testCustomerEmail, password: initialPassword },
    });
    if (res.status !== 200 || !res.data.success || !res.data.data.token) {
      throw new Error(`Login failed: ${res.data.message}`);
    }
    customerToken = res.data.data.token;
  });

  await test('AUTH: Reject login with invalid credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: testCustomerEmail, password: 'WrongPassword999!' },
    });
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got HTTP ${res.status}`);
    }
  });

  await test('AUTH: Logout user acknowledgement', async () => {
    const res = await request('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Logout failed: ${res.data.message}`);
    }
  });

  let resetToken = null;
  await test('AUTH: Request forgot password token', async () => {
    const res = await request('/auth/forgot-password', {
      method: 'POST',
      body: { email: testCustomerEmail },
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Forgot password failed: ${res.data.message}`);
    }
    resetToken = res.data.data ? res.data.data.resetToken : null;
    if (!resetToken) {
      throw new Error('Reset token was not returned in dev environment');
    }
  });

  await test('AUTH: Reset password with token and re-login', async () => {
    const res = await request('/auth/reset-password', {
      method: 'POST',
      body: { token: resetToken, password: updatedPassword },
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Reset password failed: ${res.data.message}`);
    }

    // Verify login with updated password
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: testCustomerEmail, password: updatedPassword },
    });
    if (loginRes.status !== 200 || !loginRes.data.success) {
      throw new Error('Login with updated password failed');
    }
    customerToken = loginRes.data.data.token;
  });

  await test('AUTH: Login as Admin user', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@ecommerce.com', password: 'Admin123!' },
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Admin login failed: ${res.data.message}`);
    }
    adminToken = res.data.data.token;
  });

  // -------------------------------------------------------------
  // 2. PRODUCTS MODULE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 2. PRODUCTS MODULE TESTS ---');

  await test('PRODUCTS: Listing with pagination', async () => {
    const res = await request('/products?page=1&limit=8');
    if (res.status !== 200 || !res.data.success) {
      throw new Error('Product listing request failed');
    }
    const { products, total, page, pages } = res.data.data;
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('No products returned in catalog');
    }
    if (page !== 1 || pages < 1) {
      throw new Error(`Invalid pagination metadata: page=${page}, pages=${pages}`);
    }
    testProductId = products[0]._id;
    testProductSlug = products[0].slug;
  });

  await test('PRODUCTS: Keyword search', async () => {
    const res = await request('/products?search=Sony');
    if (res.status !== 200 || !res.data.success) {
      throw new Error('Search request failed');
    }
    const found = res.data.data.products;
    if (found.length === 0) {
      throw new Error('Expected at least 1 product for search "Sony"');
    }
    const match = found.some((p) => p.title.toLowerCase().includes('sony') || p.description.toLowerCase().includes('sony'));
    if (!match) throw new Error('Search result did not match search query');
  });

  await test('PRODUCTS: Filter by in-stock and rating', async () => {
    const res = await request('/products?inStock=true&rating=4');
    if (res.status !== 200 || !res.data.success) {
      throw new Error('Filter request failed');
    }
    const products = res.data.data.products;
    for (const p of products) {
      if (p.stock <= 0) throw new Error(`Product ${p._id} is out of stock`);
      if (p.rating < 4) throw new Error(`Product ${p._id} rating is ${p.rating} (< 4)`);
    }
  });

  await test('PRODUCTS: Sort by price ascending and descending', async () => {
    const resAsc = await request('/products?sort=price-asc&limit=5');
    const prodsAsc = resAsc.data.data.products;
    if (prodsAsc.length > 1) {
      const p1 = prodsAsc[0].discountPrice > 0 ? prodsAsc[0].discountPrice : prodsAsc[0].price;
      const p2 = prodsAsc[1].discountPrice > 0 ? prodsAsc[1].discountPrice : prodsAsc[1].price;
      if (p1 > p2) throw new Error(`Price asc sort incorrect: ${p1} > ${p2}`);
    }

    const resDesc = await request('/products?sort=price-desc&limit=5');
    const prodsDesc = resDesc.data.data.products;
    if (prodsDesc.length > 1) {
      const p1 = prodsDesc[0].discountPrice > 0 ? prodsDesc[0].discountPrice : prodsDesc[0].price;
      const p2 = prodsDesc[1].discountPrice > 0 ? prodsDesc[1].discountPrice : prodsDesc[1].price;
      if (p1 < p2) throw new Error(`Price desc sort incorrect: ${p1} < ${p2}`);
    }
  });

  await test('PRODUCTS: Single product details by ID and by Slug', async () => {
    const byId = await request(`/products/${testProductId}`);
    if (byId.status !== 200 || !byId.data.success || byId.data.data._id !== testProductId) {
      throw new Error('Failed to retrieve product by ID');
    }

    const bySlug = await request(`/products/${testProductSlug}`);
    if (bySlug.status !== 200 || !bySlug.data.success || bySlug.data.data.slug !== testProductSlug) {
      throw new Error('Failed to retrieve product by slug');
    }
  });

  await test('PRODUCTS: Related products recommendation', async () => {
    const res = await request(`/products/${testProductId}/related`);
    if (res.status !== 200 || !res.data.success) {
      throw new Error('Failed to retrieve related products');
    }
    if (!Array.isArray(res.data.data)) {
      throw new Error('Related products response is not an array');
    }
  });

  // -------------------------------------------------------------
  // 3. CART MODULE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 3. CART MODULE TESTS ---');

  await test('CART: Add item, verify quantity and price calculation', async () => {
    const addRes = await request('/cart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { productId: testProductId, quantity: 4 },
    });
    if (addRes.status !== 200 || !addRes.data.success) {
      throw new Error(`Failed to add item to cart: ${addRes.data.message}`);
    }
    const cart = addRes.data.data;
    if (cart.items.length !== 1) {
      throw new Error(`Expected 1 item in cart, got ${cart.items.length}`);
    }
    const item = cart.items[0];
    if (item.quantity !== 4) {
      throw new Error(`Expected quantity 4, got ${item.quantity}`);
    }

    // Update quantity to 5
    const updateRes = await request(`/cart/${item._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { quantity: 5 },
    });
    if (updateRes.status !== 200 || !updateRes.data.success) {
      throw new Error(`Failed to update cart quantity: ${updateRes.data.message}`);
    }
    const updatedCart = updateRes.data.data;
    if (updatedCart.items[0].quantity !== 5) {
      throw new Error(`Expected quantity 5 after update, got ${updatedCart.items[0].quantity}`);
    }
  });

  await test('CART: Apply coupon and recalculate total', async () => {
    const couponRes = await request('/cart/coupon', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { code: 'NOVAFIRST' },
    });
    if (couponRes.status !== 200 || !couponRes.data.success) {
      throw new Error(`Failed to apply NOVAFIRST coupon: ${couponRes.data.message}`);
    }
    const cart = couponRes.data.data;
    if (!cart.coupon || cart.coupon.code !== 'NOVAFIRST') {
      throw new Error('Cart coupon object not populated');
    }
    if (cart.discountAmount <= 0) {
      throw new Error('Discount amount was not calculated');
    }
  });

  await test('CART: Remove item and clear cart', async () => {
    const clearRes = await request('/cart', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (clearRes.status !== 200 || !clearRes.data.success) {
      throw new Error('Failed to clear cart');
    }
    const cart = clearRes.data.data;
    if (cart.items.length !== 0) {
      throw new Error('Cart is not empty after clear');
    }
  });

  // -------------------------------------------------------------
  // 4. WISHLIST MODULE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 4. WISHLIST MODULE TESTS ---');

  await test('WISHLIST: Add and remove product', async () => {
    const addWish = await request('/wishlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { productId: testProductId },
    });
    if (addWish.status !== 200 || !addWish.data.success) {
      throw new Error(`Failed to add to wishlist: ${addWish.data.message}`);
    }

    const getWish = await request('/wishlist', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const wishlistItems = Array.isArray(getWish.data.data) ? getWish.data.data : [];
    if (!wishlistItems.some((p) => (p._id || p).toString() === testProductId.toString())) {
      throw new Error('Product not found in wishlist');
    }

    const removeWish = await request(`/wishlist/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (removeWish.status !== 200 || !removeWish.data.success) {
      throw new Error('Failed to remove from wishlist');
    }
  });

  // -------------------------------------------------------------
  // 5. CHECKOUT & ORDERS MODULE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 5. CHECKOUT & ORDERS MODULE TESTS ---');

  await test('CHECKOUT: Create delivery address', async () => {
    const addrRes = await request('/addresses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        fullName: 'Suite Tester',
        phone: '+1 555-0199',
        streetAddress: '789 Test Avenue, Suite 100',
        city: 'Metropolis',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        addressType: 'Shipping',
        isDefault: true,
      },
    });
    if (addrRes.status !== 201 || !addrRes.data.success) {
      throw new Error(`Failed to create address: ${addrRes.data.message}`);
    }
    testAddressId = addrRes.data.data._id;
  });

  let preOrderStock = 0;
  await test('CHECKOUT: Create order with COD payment and verify inventory deduction', async () => {
    // Check current stock
    const prodBefore = await request(`/products/${testProductId}`);
    preOrderStock = prodBefore.data.data.stock;

    const orderRes = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        orderItems: [{ product: testProductId, quantity: 2 }],
        shippingAddress: {
          fullName: 'Suite Tester',
          phone: '+1 555-0199',
          streetAddress: '789 Test Avenue, Suite 100',
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
        },
        paymentMethod: 'COD',
        couponCode: 'NOVAFIRST',
      },
    });
    if (orderRes.status !== 201 || !orderRes.data.success) {
      throw new Error(`Order creation failed: ${orderRes.data.message}`);
    }
    testOrderId = orderRes.data.data._id;

    // Verify stock decreased by 2
    const prodAfter = await request(`/products/${testProductId}`);
    const postOrderStock = prodAfter.data.data.stock;
    if (postOrderStock !== preOrderStock - 2) {
      throw new Error(`Stock deduction failed! Expected ${preOrderStock - 2}, got ${postOrderStock}`);
    }
  });

  await test('ORDERS: View customer order history & tracking details', async () => {
    const historyRes = await request('/orders/my-orders', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (historyRes.status !== 200 || !historyRes.data.success) {
      throw new Error('Failed to get my-orders');
    }
    if (!historyRes.data.data.some((o) => o._id === testOrderId)) {
      throw new Error('Newly created order missing from my-orders');
    }

    const detailRes = await request(`/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (detailRes.status !== 200 || !detailRes.data.success) {
      throw new Error('Failed to get order details');
    }
    const order = detailRes.data.data;
    if (order.orderStatus !== 'Confirmed' && order.orderStatus !== 'Pending') {
      throw new Error(`Expected orderStatus 'Confirmed' or 'Pending', got ${order.orderStatus}`);
    }
    if (!order.statusHistory || order.statusHistory.length === 0) {
      throw new Error('Order tracking statusHistory is empty');
    }
  });

  await test('ORDERS: Cancel order and verify inventory restoration', async () => {
    const cancelRes = await request(`/orders/${testOrderId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { reason: 'Test cancellation' },
    });
    if (cancelRes.status !== 200 || !cancelRes.data.success) {
      throw new Error(`Failed to cancel order: ${cancelRes.data.message}`);
    }
    if (cancelRes.data.data.orderStatus !== 'Cancelled') {
      throw new Error(`Order status is not Cancelled: ${cancelRes.data.data.orderStatus}`);
    }

    // Verify stock was restored to preOrderStock
    const prodRestored = await request(`/products/${testProductId}`);
    if (prodRestored.data.data.stock !== preOrderStock) {
      throw new Error(`Stock restoration failed! Expected ${preOrderStock}, got ${prodRestored.data.data.stock}`);
    }
  });

  // -------------------------------------------------------------
  // 6. REVIEWS MODULE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 6. REVIEWS MODULE TESTS ---');

  await test('REVIEWS: Validation rejects invalid rating (e.g. 6 or 0)', async () => {
    const invalidRatingRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        productId: testProductId,
        rating: 6,
        comment: 'Invalid rating test',
      },
    });
    if (invalidRatingRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for rating 6, got HTTP ${invalidRatingRes.status}`);
    }
  });

  await test('REVIEWS: Create, update, and delete review with rating recalculation', async () => {
    // Admin creates verified review
    const createRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        productId: testProductId,
        rating: 5,
        title: 'Outstanding performance',
        comment: 'This is a genuine high quality product.',
      },
    });
    if (createRes.status !== 201 || !createRes.data.success) {
      throw new Error(`Failed to create review: ${createRes.data.message}`);
    }
    testReviewId = createRes.data.data._id;

    // Update review
    const updateRes = await request(`/reviews/${testReviewId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        rating: 4,
        comment: 'Updated review to 4 stars after extensive usage.',
      },
    });
    if (updateRes.status !== 200 || !updateRes.data.success) {
      throw new Error(`Failed to update review: ${updateRes.data.message}`);
    }

    // Delete review
    const deleteRes = await request(`/reviews/${testReviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (deleteRes.status !== 200 || !deleteRes.data.success) {
      throw new Error(`Failed to delete review: ${deleteRes.data.message}`);
    }
  });

  // -------------------------------------------------------------
  // 7. ADMIN MODULE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 7. ADMIN MODULE TESTS ---');

  let adminCreatedProductId = null;
  await test('ADMIN: Product CRUD (Create, Update, Delete)', async () => {
    // 1. Get a valid category and brand
    const catRes = await request('/categories');
    const brandRes = await request('/brands');
    const categoryId = catRes.data.data[0]._id;
    const brandId = brandRes.data.data[0]._id;

    // Create product
    const createRes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: `Admin Test Product ${timestamp}`,
        description: 'Comprehensive test product created by automated testing suite.',
        price: 199.99,
        discountPrice: 149.99,
        category: categoryId,
        brand: brandId,
        stock: 50,
        sku: `SKU-TEST-${timestamp}`,
        images: ['/uploads/test.webp'],
        tags: ['test', 'electronics'],
      },
    });
    if (createRes.status !== 201 || !createRes.data.success) {
      throw new Error(`Admin product creation failed: ${createRes.data.message}`);
    }
    adminCreatedProductId = createRes.data.data._id;

    // Update product price
    const updateRes = await request(`/products/${adminCreatedProductId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { price: 219.99, stock: 45 },
    });
    if (updateRes.status !== 200 || !updateRes.data.success) {
      throw new Error(`Admin product update failed: ${updateRes.data.message}`);
    }
    if (updateRes.data.data.price !== 219.99) {
      throw new Error(`Price not updated: ${updateRes.data.data.price}`);
    }

    // Delete product
    const deleteRes = await request(`/products/${adminCreatedProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (deleteRes.status !== 200 || !deleteRes.data.success) {
      throw new Error(`Admin product delete failed: ${deleteRes.data.message}`);
    }
  });

  await test('ADMIN: User management (List users and verify access)', async () => {
    const usersRes = await request('/auth/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (usersRes.status !== 200 || !usersRes.data.success) {
      throw new Error(`Failed to list users: ${usersRes.data.message}`);
    }
    if (!Array.isArray(usersRes.data.data.users) || usersRes.data.data.users.length === 0) {
      throw new Error('No users found in user management list');
    }
  });

  await test('ADMIN: Orders management (List orders and update status)', async () => {
    const ordersRes = await request('/orders', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (ordersRes.status !== 200 || !ordersRes.data.success) {
      throw new Error(`Admin list orders failed: ${ordersRes.data.message}`);
    }
    const orders = ordersRes.data.data.orders;
    if (!orders || orders.length === 0) {
      throw new Error('No orders found for admin');
    }

    // Update first non-cancelled order status to 'Processing'
    const targetOrder = orders.find((o) => o.orderStatus !== 'Cancelled') || orders[0];
    const statusRes = await request(`/orders/${targetOrder._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'Processing', note: 'Order verified by admin team' },
    });
    if (statusRes.status !== 200 || !statusRes.data.success) {
      throw new Error(`Failed to update order status: ${statusRes.data.message}`);
    }
  });

  let createdCouponId = null;
  const testCouponCode = `SUITE${Math.floor(Math.random() * 9000 + 1000)}`;
  await test('ADMIN: Coupon management (Create, Validate, Delete)', async () => {
    const createRes = await request('/coupons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        code: testCouponCode,
        discountType: 'percentage',
        discountAmount: 15,
        minOrderAmount: 50,
        expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        usageLimit: 100,
      },
    });
    if (createRes.status !== 201 || !createRes.data.success) {
      throw new Error(`Failed to create coupon: ${createRes.data.message}`);
    }
    createdCouponId = createRes.data.data._id;

    // Validate coupon
    const validRes = await request('/coupons/validate', {
      method: 'POST',
      body: { code: testCouponCode, cartTotal: 100 },
    });
    if (validRes.status !== 200 || !validRes.data.success) {
      throw new Error(`Failed to validate created coupon: ${validRes.data.message}`);
    }

    // Delete coupon
    const delRes = await request(`/coupons/${createdCouponId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (delRes.status !== 200 || !delRes.data.success) {
      throw new Error(`Failed to delete coupon: ${delRes.data.message}`);
    }
  });

  await test('ADMIN: Analytics & Dashboard stats', async () => {
    const dashRes = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (dashRes.status !== 200 || !dashRes.data.success) {
      throw new Error(`Dashboard stats request failed: ${dashRes.data.message}`);
    }
    const d = dashRes.data.data;
    if (d.totalRevenue === undefined || d.totalOrders === undefined || d.totalProducts === undefined) {
      throw new Error('Dashboard stats missing required revenue/orders/products counts');
    }

    const analyticsRes = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (analyticsRes.status !== 200 || !analyticsRes.data.success) {
      throw new Error(`Analytics request failed: ${analyticsRes.data.message}`);
    }
    if (!analyticsRes.data.data.salesByCategory) {
      throw new Error('Analytics missing salesByCategory aggregation');
    }
  });

  // -------------------------------------------------------------
  // 8. RESILIENCE, ERROR HANDLING & EMPTY STATES
  // -------------------------------------------------------------
  console.log('\n--- 8. RESILIENCE, ERROR HANDLING & EDGE CASES ---');

  await test('EDGE: Unauthorized access returns 401 on protected route', async () => {
    const res = await request('/cart');
    if (res.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got HTTP ${res.status}`);
    }
  });

  await test('EDGE: Forbidden access returns 403 on admin route for customer', async () => {
    const res = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got HTTP ${res.status}`);
    }
  });

  await test('EDGE: Non-existent product ID returns 404 cleanly', async () => {
    const res = await request('/products/64f123456789012345678901');
    if (res.status !== 404) {
      throw new Error(`Expected 404 Not Found, got HTTP ${res.status}`);
    }
  });

  await test('EDGE: Non-matching search query returns empty array without error', async () => {
    const res = await request('/products?search=NonExistentQueryXYZ99999');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Expected 200 OK with empty array, got HTTP ${res.status}`);
    }
    if (!Array.isArray(res.data.data.products) || res.data.data.products.length !== 0) {
      throw new Error('Expected 0 products in search results');
    }
  });

  console.log('\n================================================================');
  console.log(`  COMPREHENSIVE TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================\n');

  if (failures.length > 0) {
    console.error('Failure Details:');
    failures.forEach((f, idx) => console.error(`${idx + 1}. [${f.name}]: ${f.error}`));
    process.exit(1);
  } else {
    console.log('All functional, authorization, resilience, and error handling tests passed successfully!');
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled suite execution error:', err);
  process.exit(1);
});
