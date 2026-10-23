const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountAmount: {
      type: Number,
      required: [true, 'Please provide discount amount'],
      min: [0, 'Discount amount must be positive'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount must be positive'],
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // 0 means no cap
      min: [0, 'Max discount amount must be positive'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide coupon expiry date'],
      index: true,
    },
    usageLimit: {
      type: Number,
      default: 100, // total allowable usages
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    userUsageLimit: {
      type: Number,
      default: 1, // times an individual user can use
      min: [1, 'Per-user limit must be at least 1'],
    },
    usersUsed: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Performance compound index for coupon validation
couponSchema.index({ code: 1, isActive: 1, expiryDate: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });

// Instance method to check validity for a given user & order subtotal
couponSchema.methods.isValid = function (userId, orderAmount = 0) {
  if (!this.isActive) {
    return { valid: false, message: 'This coupon is inactive' };
  }

  const now = new Date();
  if (this.expiryDate && now > this.expiryDate) {
    return { valid: false, message: 'This coupon has expired' };
  }

  if (this.startDate && now < this.startDate) {
    return { valid: false, message: 'This coupon is not active yet' };
  }

  if (this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }

  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of $${this.minOrderAmount.toFixed(2)} required to use this coupon`,
    };
  }

  if (userId) {
    const userUsage = this.usersUsed.find(
      (u) => u.user.toString() === userId.toString()
    );
    if (userUsage && userUsage.count >= this.userUsageLimit) {
      return {
        valid: false,
        message: 'You have already reached the maximum usage limit for this coupon',
      };
    }
  }

  const discount = this.calculateDiscount(orderAmount);
  return { valid: true, discount };
};

// Calculate effective discount based on type and limits
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountAmount) / 100;
    if (this.maxDiscountAmount > 0 && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = this.discountAmount;
  }

  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);
