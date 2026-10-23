const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Setting = require('../models/Setting');

// Helper to calculate days from range string
const getStartDateFromRange = (range = '7d') => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  switch (range) {
    case '30d':
      d.setDate(d.getDate() - 29);
      break;
    case '90d':
      d.setDate(d.getDate() - 89);
      break;
    case '1y':
      d.setFullYear(d.getFullYear() - 1);
      break;
    case '7d':
    default:
      d.setDate(d.getDate() - 6);
      break;
  }
  return d;
};

// @desc    Admin Dashboard Key Metrics & Charts
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] },
    });
    const completedOrders = await Order.countDocuments({
      orderStatus: 'Delivered',
    });

    // Total Revenue (all non-cancelled orders)
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled', 'Refunded'] } } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const totalSales = revenueAgg.length > 0 ? Number(revenueAgg[0].totalSales.toFixed(2)) : 0;

    // Today's Revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenueAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart },
          orderStatus: { $nin: ['Cancelled', 'Refunded'] },
        },
      },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const todayRevenue = todayRevenueAgg.length > 0 ? Number(todayRevenueAgg[0].totalSales.toFixed(2)) : 0;

    // Monthly Revenue (Current Month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyRevenueAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          orderStatus: { $nin: ['Cancelled', 'Refunded'] },
        },
      },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const monthlyRevenue = monthlyRevenueAgg.length > 0 ? Number(monthlyRevenueAgg[0].totalSales.toFixed(2)) : 0;

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    })
      .select('title sku stock lowStockThreshold images price category')
      .populate('category', 'name')
      .limit(10);

    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    });

    // Recent 6 Orders
    const recentOrders = await Order.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent 6 Customers with order counts
    const rawCustomers = await User.find({ role: 'customer' })
      .select('name email createdAt avatar phone')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const recentCustomers = await Promise.all(
      rawCustomers.map(async (c) => {
        const orderCount = await Order.countDocuments({ user: c._id });
        const userSpentAgg = await Order.aggregate([
          { $match: { user: c._id, orderStatus: { $nin: ['Cancelled', 'Refunded'] } } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        const totalSpent = userSpentAgg.length > 0 ? Number(userSpentAgg[0].total.toFixed(2)) : 0;
        return {
          ...c,
          orderCount,
          totalSpent,
        };
      })
    );

    // Sales by Date Range (Last 7 days daily revenue & orders)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailySalesAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          orderStatus: { $nin: ['Cancelled', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          sales: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build complete 7-day array
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = dailySalesAgg.find((item) => item._id === dateStr);
      last7Days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        sales: found ? Number(found.sales.toFixed(2)) : 0,
        orders: found ? found.orders : 0,
      });
    }

    // Top Selling Products (aggregated from order items)
    const topProductsAgg = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled', 'Refunded'] } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          title: { $first: '$orderItems.title' },
          image: { $first: '$orderItems.image' },
          price: { $first: '$orderItems.price' },
          totalSold: { $sum: '$orderItems.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 6 },
    ]);

    // Sales by Category
    const categorySales = await Category.find({ isActive: true });
    const categoryBreakdown = [];
    for (const cat of categorySales) {
      const productIds = await Product.find({ category: cat._id }).distinct('_id');
      const catOrders = await Order.aggregate([
        { $match: { orderStatus: { $nin: ['Cancelled', 'Refunded'] } } },
        { $unwind: '$orderItems' },
        { $match: { 'orderItems.product': { $in: productIds } } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            count: { $sum: '$orderItems.quantity' },
          },
        },
      ]);
      const catTotal = catOrders.length > 0 ? Number(catOrders[0].total.toFixed(2)) : 0;
      const catUnits = catOrders.length > 0 ? catOrders[0].count : 0;
      const percentage = totalSales > 0 ? Math.round((catTotal / totalSales) * 100) : 0;

      categoryBreakdown.push({
        category: cat.name,
        total: catTotal,
        count: catUnits,
        percentage,
      });
    }

    const summaryData = {
      totalSales,
      totalRevenue: totalSales,
      todayRevenue,
      monthlyRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
    };

    res.json({
      success: true,
      data: {
        ...summaryData,
        summary: summaryData,
        dailySales: last7Days,
        topProducts: topProductsAgg,
        recentOrders,
        recentCustomers,
        lowStockProducts,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dedicated Deep Business Intelligence Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const startDate = getStartDateFromRange(range);

    const ordersInRange = await Order.find({
      createdAt: { $gte: startDate },
      orderStatus: { $nin: ['Cancelled', 'Refunded'] },
    });

    const totalRevenueInRange = ordersInRange.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const totalOrdersInRange = ordersInRange.length;
    const averageOrderValue = totalOrdersInRange > 0 ? Number((totalRevenueInRange / totalOrdersInRange).toFixed(2)) : 0;

    const trendAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $nin: ['Cancelled', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $nin: ['Cancelled', 'Refunded'] },
        },
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          title: { $first: '$orderItems.title' },
          image: { $first: '$orderItems.image' },
          price: { $first: '$orderItems.price' },
          totalUnits: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    const categories = await Category.find({ isActive: true });
    const categoryStats = [];
    for (const cat of categories) {
      const productIds = await Product.find({ category: cat._id }).distinct('_id');
      const catAgg = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            orderStatus: { $nin: ['Cancelled', 'Refunded'] },
          },
        },
        { $unwind: '$orderItems' },
        { $match: { 'orderItems.product': { $in: productIds } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            units: { $sum: '$orderItems.quantity' },
          },
        },
      ]);
      const catRev = catAgg.length > 0 ? Number(catAgg[0].revenue.toFixed(2)) : 0;
      const catUnits = catAgg.length > 0 ? catAgg[0].units : 0;
      const share = totalRevenueInRange > 0 ? Math.round((catRev / totalRevenueInRange) * 100) : 0;

      categoryStats.push({
        category: cat.name,
        revenue: catRev,
        units: catUnits,
        share,
      });
    }

    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startDate },
    });

    const totalCustomers = await User.countDocuments({ role: 'customer' });

    res.json({
      success: true,
      data: {
        range,
        totalRevenue: Number(totalRevenueInRange.toFixed(2)),
        totalOrders: totalOrdersInRange,
        averageOrderValue,
        salesTrends: trendAgg,
        salesTrend: trendAgg,
        topProducts,
        categoryStats,
        categoryPerformance: categoryStats,
        salesByCategory: categoryStats,
        customerStats: {
          newCustomersInRange: newCustomers,
          totalCustomers,
        },
        summary: {
          totalRevenue: Number(totalRevenueInRange.toFixed(2)),
          totalOrders: totalOrdersInRange,
          averageOrderValue,
          newCustomers,
          totalCustomers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get website settings
// @route   GET /api/admin/settings
// @access  Public / Private
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update website settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    const fields = [
      'storeName',
      'storeEmail',
      'storePhone',
      'address',
      'currency',
      'currencySymbol',
      'taxRate',
      'shippingFee',
      'freeShippingThreshold',
      'announcementBar',
      'showAnnouncement',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    const updated = await settings.save();

    res.json({
      success: true,
      message: 'Store settings updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getSettings,
  updateSettings,
};
