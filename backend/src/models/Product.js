const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: [true, 'Specification key is required'], trim: true },
    value: { type: String, required: [true, 'Specification value is required'], trim: true },
  },
  { _id: false }
);

const variantOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Variant name is required'], trim: true }, // e.g. "Color" or "Size"
    options: [{ type: String, trim: true }],                                           // e.g. ["Midnight Black", "Platinum Silver"]
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter product title'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'Please enter product SKU'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price must be positive'],
      index: true,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price must be positive'],
    },
    stock: {
      type: Number,
      required: [true, 'Please enter stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
      index: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Please select a brand'],
      index: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one image',
      },
    },
    imageDetails: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        size: { type: Number, default: 0 },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      index: true,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
      index: true,
    },
    specifications: [specificationSchema],
    variants: [variantOptionSchema],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.price > 0 && this.discountPrice > 0 && this.discountPrice < this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Virtual inStock boolean
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Text index for full-text keyword search across title, description, and tags
productSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 }, name: 'ProductTextIndex' }
);

// Compound indexes for query optimization
productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ brand: 1, isActive: 1, price: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, stock: 1 });
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isBestseller: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isNewArrival: 1, createdAt: -1 });
productSchema.index({ rating: -1, numReviews: -1 });

module.exports = mongoose.model('Product', productSchema);
