const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    price: {
      type: Number,
      required: [true, 'Item unit price is required'],
      min: [0, 'Price must be positive'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    selectedVariant: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound indexes
orderItemSchema.index({ order: 1, product: 1 });
orderItemSchema.index({ product: 1, createdAt: -1 });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

// Export both model and schema for embedded or referenced consumption
OrderItem.orderItemSchema = orderItemSchema;
OrderItem.OrderItem = OrderItem;

module.exports = OrderItem;
