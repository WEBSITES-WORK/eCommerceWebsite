const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');

// Helper to generate readable order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.streetAddress || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Verify each product in database, check stock, calculate itemsPrice
    let itemsPrice = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product '${item.title || item.product}' is no longer available`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.title}'. Only ${product.stock} available.`,
        });
      }

      const unitPrice =
        product.discountPrice > 0 ? product.discountPrice : product.price;

      itemsPrice += unitPrice * item.quantity;

      verifiedOrderItems.push({
        product: product._id,
        title: product.title,
        image: item.image || (product.images.length > 0 ? product.images[0] : ''),
        price: unitPrice,
        quantity: item.quantity,
        sku: product.sku,
        selectedVariant: item.selectedVariant || {},
      });
    }

    // Get store settings
    let settings = await Setting.findOne();
    if (!settings) {
      settings = { taxRate: 8.5, shippingFee: 15.0, freeShippingThreshold: 99.0 };
    }

    // Handle coupon
    let discountAmount = 0;
    let appliedCouponData = null;
    let couponDoc = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (couponDoc) {
        const val = couponDoc.isValid(req.user._id, itemsPrice);
        if (val.valid) {
          discountAmount = val.discount;
          appliedCouponData = {
            code: couponDoc.code,
            discountAmount: discountAmount,
            discountType: couponDoc.discountType,
          };
        }
      }
    }

    const taxableAmount = Math.max(0, itemsPrice - discountAmount);
    const taxPrice = Number(((taxableAmount * settings.taxRate) / 100).toFixed(2));
    const shippingPrice =
      itemsPrice >= settings.freeShippingThreshold ? 0 : Number(settings.shippingFee.toFixed(2));
    const totalPrice = Number((taxableAmount + taxPrice + shippingPrice).toFixed(2));

    const orderNumber = generateOrderNumber();

    // Create Order
    const order = new Order({
      orderNumber,
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
      itemsPrice: Number(itemsPrice.toFixed(2)),
      taxPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
      coupon: appliedCouponData,
      orderStatus: 'Confirmed',
      isPaid: paymentMethod !== 'COD',
      paidAt: paymentMethod !== 'COD' ? Date.now() : null,
      statusHistory: [
        {
          status: 'Confirmed',
          note: `Order placed via ${paymentMethod || 'COD'}`,
          timestamp: new Date(),
        },
      ],
    });

    const savedOrder = await order.save();

    // Deduct inventory stock for each product
    for (const item of verifiedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Update coupon usage if applied
    if (couponDoc && appliedCouponData) {
      couponDoc.usedCount += 1;
      const userIndex = couponDoc.usersUsed.findIndex(
        (u) => u.user && u.user.toString() === req.user._id.toString()
      );
      if (userIndex > -1) {
        couponDoc.usersUsed[userIndex].count += 1;
      } else {
        couponDoc.usersUsed.push({ user: req.user._id, count: 1 });
      }
      await couponDoc.save();
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], coupon: null }
    );

    // Create confirmation notification for customer
    await Notification.create({
      user: req.user._id,
      title: 'Order Confirmed! 🎉',
      message: `Your order #${order.orderNumber} has been received and is being processed.`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorize: customer must own order or be admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer: Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Cannot cancel if already packed, shipped or delivered
    const nonCancellable = ['Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];
    if (nonCancellable.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.orderStatus}' state.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      note: reason || 'Order cancelled by customer',
      timestamp: new Date(),
    });

    await order.save();

    // Restore inventory stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await Notification.create({
      user: order.user,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled and stock restored.`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all orders with filtering and pagination
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.search) {
      query.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order status & tracking info
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, carrier, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;

    if (status && status !== oldStatus) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        note: note || `Status changed to ${status}`,
        timestamp: new Date(),
      });

      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        order.paymentStatus = 'Completed';
        order.isPaid = true;
      }

      // If changed to Cancelled/Refunded from non-cancelled status, restore stock
      if (['Cancelled', 'Refunded'].includes(status) && !['Cancelled', 'Refunded'].includes(oldStatus)) {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (carrier !== undefined) order.carrier = carrier;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'Completed') {
        order.isPaid = true;
        order.paidAt = new Date();
      }
    }

    const updated = await order.save();

    // Send customer notification
    await Notification.create({
      user: order.user,
      title: `Order #${order.orderNumber} Updated`,
      message: `Your order status is now: ${order.orderStatus}`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order was not cancelled, restore inventory
    if (!['Cancelled', 'Refunded'].includes(order.orderStatus)) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
