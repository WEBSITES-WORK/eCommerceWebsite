const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    selectedVariant: {
      type: Map,
      of: String,
      default: {},
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total quantity of items
cartSchema.virtual('totalQuantity').get(function () {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => total + (item.quantity || 0), 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function () {
  if (!this.items) return 0;
  return Number(
    this.items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0).toFixed(2)
  );
});

module.exports = mongoose.model('Cart', cartSchema);
