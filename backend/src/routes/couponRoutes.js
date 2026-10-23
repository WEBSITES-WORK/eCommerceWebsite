const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/validate', apiLimiter, validateCoupon);

// Admin coupon management
router.get('/', protect, authorize('admin'), getCoupons);
router.get('/:id', protect, authorize('admin'), getCouponById);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
