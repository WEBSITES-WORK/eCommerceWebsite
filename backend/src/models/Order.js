const mongoose = require('mongoose');
const { orderItemSchema } = require('./OrderItem');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Refunded',
      ],
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      fullName: { type: String, required: [true, 'Recipient name is required'], trim: true },
      phone: { type: String, required: [true, 'Contact phone is required'], trim: true },
      streetAddress: { type: String, required: [true, 'Street address is required'], trim: true },
      apartment: { type: String, default: '', trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
      postalCode: { type: String, required: [true, 'Postal code is required'], trim: true },
      country: { type: String, required: [true, 'Country is required'], default: 'United States', trim: true },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['COD', 'Card', 'PayPal', 'Stripe'],
      default: 'COD',
      index: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    paymentResult: {
      id: { type: String, default: '' },
      status: { type: String, default: '' },
      update_time: { type: String, default: '' },
      email_address: { type: String, default: '' },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Items price cannot be negative'],
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Shipping price cannot be negative'],
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Tax price cannot be negative'],
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Discount amount cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Total price cannot be negative'],
    },
    coupon: {
      code: { type: String, uppercase: true, trim: true },
      discountAmount: { type: Number, default: 0 },
      discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Refunded',
      ],
      default: 'Pending',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      default: '',
      trim: true,
    },
    carrier: {
      type: String,
      default: 'Standard Express',
      trim: true,
    },
    cancelReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// High-Performance Query & Analytics Compound Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1, orderStatus: 1, totalPrice: 1 });
orderSchema.index({ 'orderItems.product': 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
