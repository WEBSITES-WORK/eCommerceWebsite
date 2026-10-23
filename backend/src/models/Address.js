const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please enter recipient name'],
      trim: true,
      maxLength: [70, 'Name cannot exceed 70 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Please enter contact phone number'],
      trim: true,
    },
    streetAddress: {
      type: String,
      required: [true, 'Please enter street address'],
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'Please enter city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please enter state/province'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Please enter postal/zip code'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please enter country'],
      default: 'United States',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    addressType: {
      type: String,
      enum: ['Home', 'Office', 'Shipping', 'Billing', 'Other'],
      default: 'Home',
      set: (val) => {
        if (!val || typeof val !== 'string') return 'Home';
        const capitalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        return ['Home', 'Office', 'Shipping', 'Billing', 'Other'].includes(capitalized) ? capitalized : 'Other';
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure only one default address exists per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Performance compound index for fast user address retrieval
addressSchema.index({ user: 1, isDefault: -1, createdAt: -1 });

module.exports = mongoose.model('Address', addressSchema);
