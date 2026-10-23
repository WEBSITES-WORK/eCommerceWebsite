const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

// Multer error handling wrapper
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowable limit of 5MB',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded. Maximum 8 images per request.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file',
      });
    }
    next();
  });
};

// Single image upload
router.post(
  '/',
  protect,
  authorize('admin'),
  handleUpload(upload.single('image')),
  uploadController.uploadSingle
);

// Multiple image upload (up to 8 files)
router.post(
  '/multiple',
  protect,
  authorize('admin'),
  handleUpload(upload.array('images', 8)),
  uploadController.uploadMultiple
);

// Replace existing image
router.post(
  '/replace',
  protect,
  authorize('admin'),
  handleUpload(upload.single('image')),
  uploadController.replaceImage
);

// Delete image from storage
router.delete(
  '/',
  protect,
  authorize('admin'),
  uploadController.deleteImage
);

module.exports = router;
