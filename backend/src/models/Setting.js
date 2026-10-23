const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'NovaShop',
    },
    storeEmail: {
      type: String,
      default: 'support@novashop.com',
    },
    storePhone: {
      type: String,
      default: '+1 (800) 555-0199',
    },
    address: {
      type: String,
      default: '100 Market Street, Suite 400, San Francisco, CA 94105',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    currencySymbol: {
      type: String,
      default: '$',
    },
    taxRate: {
      type: Number,
      default: 8.5, // 8.5%
    },
    shippingFee: {
      type: Number,
      default: 15.0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 99.0, // orders >= 99 get free shipping
    },
    announcementBar: {
      type: String,
      default: '✨ Free express shipping on all orders over $99! Use code NOVAFIRST for 15% off.',
    },
    showAnnouncement: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
