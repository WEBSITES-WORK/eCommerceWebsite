const API_BASE = 'http://localhost:5000/api';

async function testSecurity() {
  console.log('--- Starting Comprehensive E-Commerce Security Audit & Verification ---');
  let passCount = 0;
  let failCount = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passCount++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failCount++;
    }
  };

  // Helper request
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

  // 1. Authenticate customer 1 (Sarah)
  const cust1Login = await request('/auth/login', {
    method: 'POST',
    body: { email: 'customer@ecommerce.com', password: 'Customer123!' },
  });
  if (!cust1Login.data.success) throw new Error('Customer 1 login failed');
  const tokenCust1 = cust1Login.data.data.token;

  // 2. Authenticate customer 2 (Alex)
  const cust2Login = await request('/auth/login', {
    method: 'POST',
    body: { email: 'alex.rivers@ecommerce.com', password: 'Customer123!' },
  });
  if (!cust2Login.data.success) throw new Error('Customer 2 login failed');
  const tokenCust2 = cust2Login.data.data.token;

  // 3. Authenticate admin
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@ecommerce.com', password: 'Admin123!' },
  });
  if (!adminLogin.data.success) throw new Error('Admin login failed');
  const tokenAdmin = adminLogin.data.data.token;

  // TEST 1: HTTP Security Headers
  await test('HTTP Security Headers (No X-Powered-By, X-Content-Type-Options: nosniff, X-Frame-Options: DENY)', async () => {
    const res = await request('/health');
    const poweredBy = res.headers.get('x-powered-by');
    const nosniff = res.headers.get('x-content-type-options');
    const frameOptions = res.headers.get('x-frame-options');

    if (poweredBy) throw new Error(`x-powered-by header is exposed: ${poweredBy}`);
    if (nosniff !== 'nosniff') throw new Error('x-content-type-options: nosniff header missing');
    if (!frameOptions || !frameOptions.includes('DENY')) throw new Error('x-frame-options: DENY header missing');
  });

  // TEST 2: CORS Header Protection
  await test('CORS origin validation (rejects unauthorized origin)', async () => {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { Origin: 'https://malicious-phishing-site.com' },
    });
    // In our CORS handler, unauthorized origins are blocked with CORS error
    const allowOrigin = res.headers.get('access-control-allow-origin');
    if (allowOrigin === 'https://malicious-phishing-site.com' || allowOrigin === '*') {
      throw new Error(`CORS improperly allowed unauthorized origin: ${allowOrigin}`);
    }
  });

  // TEST 3: NoSQL / MongoDB Query Injection Prevention
  await test('NoSQL Query Injection (sanitizes operator keys like $gt)', async () => {
    // Attempt injection in login
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: { $gt: '' }, password: { $gt: '' } },
    });
    // Sanitizer removes $gt keys so req.body.email is undefined -> 400 Bad Request
    if (res.status === 200) {
      throw new Error('NoSQL injection bypassed authentication!');
    }
    if (res.status !== 400) {
      throw new Error(`Expected 400 Bad Request on sanitized input, got ${res.status}`);
    }
  });

  // TEST 4: XSS Sanitization
  await test('XSS Sanitization (strips <script> tags and event handlers)', async () => {
    const res = await request('/contact', {
      method: 'POST',
      body: {
        name: 'Attacker<script>alert("xss")</script>',
        email: 'attacker@test.com',
        subject: 'Inquiry',
        message: 'Hello <script>fetch("http://evil.com")</script> World <img src=x onerror=alert(1)>',
      },
    });

    if (!res.data.success) throw new Error('Contact message submission failed');
    const saved = res.data.data;
    if (saved.name.includes('<script>') || saved.name.includes('alert(')) {
      throw new Error('XSS script tag was not stripped from name!');
    }
    if (saved.message.includes('<script>') || saved.message.includes('onerror=')) {
      throw new Error('XSS payload was not stripped from message!');
    }
  });

  // TEST 5: Sensitive Data Exposure Protection (Passwords and Reset Tokens)
  await test('Sensitive field exposure (password, reset tokens excluded from JSON)', async () => {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenCust1}` },
    });

    if (!res.data.success) throw new Error('Failed to get user profile');
    const user = res.data.data;
    if (user.password !== undefined) throw new Error('Password hash is exposed in /auth/me!');
    if (user.resetPasswordToken !== undefined) throw new Error('resetPasswordToken is exposed in /auth/me!');
    if (user.resetPasswordExpire !== undefined) throw new Error('resetPasswordExpire is exposed in /auth/me!');
  });

  // TEST 6: IDOR Protection on Orders
  await test('IDOR: Customer 1 cannot access Customer 2 orders', async () => {
    // Get Customer 2's order ID
    const cust2Orders = await request('/orders/my-orders', {
      headers: { Authorization: `Bearer ${tokenCust2}` },
    });
    if (!cust2Orders.data.success || !cust2Orders.data.data.length) {
      throw new Error('Customer 2 has no orders to test IDOR against');
    }
    const orderIdCust2 = cust2Orders.data.data[0]._id;

    // Customer 1 tries to view Customer 2's order
    const idorAttempt = await request(`/orders/${orderIdCust2}`, {
      headers: { Authorization: `Bearer ${tokenCust1}` },
    });

    if (idorAttempt.status === 200) {
      throw new Error('CRITICAL IDOR: Customer 1 successfully accessed Customer 2 order details!');
    }
    if (idorAttempt.status !== 403) {
      throw new Error(`Expected 403 Forbidden on IDOR attempt, got HTTP ${idorAttempt.status}`);
    }
  });

  // TEST 7: IDOR Protection on Addresses
  await test('IDOR: Customer 1 cannot update Customer 2 address', async () => {
    // Get Customer 2's address
    const cust2Addr = await request('/addresses', {
      headers: { Authorization: `Bearer ${tokenCust2}` },
    });
    if (!cust2Addr.data.success || !cust2Addr.data.data.length) {
      throw new Error('Customer 2 has no addresses to test IDOR against');
    }
    const addrIdCust2 = cust2Addr.data.data[0]._id;

    // Customer 1 tries to update Customer 2's address
    const idorAddrAttempt = await request(`/addresses/${addrIdCust2}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenCust1}` },
      body: { streetAddress: 'Hacked Street 123' },
    });

    if (idorAddrAttempt.status === 200) {
      throw new Error('CRITICAL IDOR: Customer 1 modified Customer 2 address!');
    }
    if (idorAddrAttempt.status !== 404 && idorAddrAttempt.status !== 403) {
      throw new Error(`Expected 404 or 403 on address IDOR, got ${idorAddrAttempt.status}`);
    }
  });

  // TEST 8: Price Manipulation / Payment Integrity
  await test('Price Tampering Prevention (server calculates true price from DB)', async () => {
    const prodRes = await request('/products?limit=1');
    const product = prodRes.data.data.products[0];

    // Attempt to order product with forged client-side price of $0.01
    const orderAttempt = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenCust1}` },
      body: {
        orderItems: [{ product: product._id, quantity: 1, price: 0.01 }],
        shippingAddress: {
          fullName: 'Test User',
          phone: '+1 555-0100',
          streetAddress: '123 Fake Street',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
        },
        paymentMethod: 'COD',
      },
    });

    if (!orderAttempt.data.success) throw new Error('Order creation failed');
    const createdOrder = orderAttempt.data.data;
    const expectedUnitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    // Verify server forced the true DB price, ignoring client $0.01
    const itemInOrder = createdOrder.orderItems[0];
    if (itemInOrder.price !== expectedUnitPrice) {
      throw new Error(`Price tampering succeeded! Order saved with $${itemInOrder.price} instead of $${expectedUnitPrice}`);
    }
  });

  // TEST 9: Admin Privilege Escalation Prevention
  await test('Privilege Escalation Prevention (regular customer cannot promote themselves)', async () => {
    const escalateRes = await request('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenCust1}` },
      body: { role: 'admin' },
    });

    if (!escalateRes.data.success) throw new Error('Profile update failed');
    if (escalateRes.data.data.role === 'admin') {
      throw new Error('CRITICAL PRIVILEGE ESCALATION: Regular customer promoted themselves to admin!');
    }
  });

  // TEST 10: Non-Admin Access Control on Admin Endpoints
  await test('Admin route protection (blocks regular customer from /api/admin)', async () => {
    const adminRes = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${tokenCust1}` },
    });

    if (adminRes.status === 200) {
      throw new Error('Access control failure: Regular customer accessed admin dashboard!');
    }
    if (adminRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for customer on admin route, got ${adminRes.status}`);
    }
  });

  console.log('\n======================================================');
  console.log(`Security Audit Summary: ${passCount} Passed, ${failCount} Failed`);
  console.log('======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

testSecurity().catch((err) => {
  console.error('Security test failed with unhandled error:', err);
  process.exit(1);
});
