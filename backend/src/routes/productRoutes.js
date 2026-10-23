const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSearchSuggestions,
  getProduct,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/suggestions', getSearchSuggestions);

// Admin bulk endpoints
router.post('/bulk/delete', protect, authorize('admin'), bulkDeleteProducts);
router.patch('/bulk/status', protect, authorize('admin'), bulkUpdateProductStatus);

// Product details & related
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

// Admin product endpoints
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.patch('/:id/inventory', protect, authorize('admin'), updateInventory);

module.exports = router;
