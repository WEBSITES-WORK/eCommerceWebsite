const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public can read general store settings (shipping thresholds, currency, announcements)
router.get('/settings/public', getSettings);

// Protected Admin dashboard & analytics routes
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
