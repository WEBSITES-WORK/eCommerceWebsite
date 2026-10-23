const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  getAllReviews,
  toggleReviewApproval,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin review management
router.get('/', protect, authorize('admin'), getAllReviews);
router.patch('/:id/approval', protect, authorize('admin'), toggleReviewApproval);

module.exports = router;
