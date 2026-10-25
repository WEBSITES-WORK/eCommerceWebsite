const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const addressRoutes = require('./routes/addressRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const mongoSanitize = require('./middleware/mongoSanitize');
const xssSanitize = require('./middleware/xssSanitize');

const app = express();

// Explicitly disable X-Powered-By header
app.disable('x-powered-by');

// Connect to MongoDB
connectDB();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
    xPoweredBy: false,
  })
);

// Strict CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'https://ecommercewebsite-dusky.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin === 'https://ecommercewebsite-dusky.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        (/^http:\/\/localhost:\d+$/.test(origin)) ||
        (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Sanitize inputs against NoSQL query injection & XSS
app.use(mongoSanitize);
app.use(xssSanitize);

// Static uploads folder (safely served)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// General rate limiter on API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NovaShop E-Commerce API is running healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Dynamic XML Sitemap for SEO Crawlers
app.get('/sitemap.xml', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Category = require('./models/Category');
    const Brand = require('./models/Brand');

    const clientUrl = process.env.CLIENT_URL || 'https://novashop.com';
    const [products, categories, brands] = await Promise.all([
      Product.find({ isActive: true }).select('slug updatedAt'),
      Category.find({ isActive: true }).select('slug updatedAt'),
      Brand.find({ isActive: true }).select('slug updatedAt'),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticRoutes = ['', '/products', '/about', '/contact', '/faq', '/terms', '/privacy'];
    for (const route of staticRoutes) {
      xml += `  <url>\n    <loc>${clientUrl}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }

    for (const p of products) {
      xml += `  <url>\n    <loc>${clientUrl}/products/${p.slug}</loc>\n    <lastmod>${(p.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    for (const c of categories) {
      xml += `  <url>\n    <loc>${clientUrl}/category/${c.slug}</loc>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    for (const b of brands) {
      xml += `  <url>\n    <loc>${clientUrl}/brand/${b.slug}</loc>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Catch 404 and forward to error handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[NovaShop Server]: Listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
