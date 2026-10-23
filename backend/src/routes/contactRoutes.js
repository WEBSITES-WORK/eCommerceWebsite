const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllMessages,
  updateContactStatus,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/', apiLimiter, submitContact);

// Admin routes
router.get('/', protect, authorize('admin'), getAllMessages);
router.patch('/:id', protect, authorize('admin'), updateContactStatus);

module.exports = router;
