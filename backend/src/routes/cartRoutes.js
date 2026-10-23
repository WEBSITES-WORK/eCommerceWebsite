const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/items/:itemId', updateCartItem);
router.put('/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/:itemId', removeCartItem);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.delete('/', clearCart);

module.exports = router;
