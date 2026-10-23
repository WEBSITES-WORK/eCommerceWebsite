const storageService = require('../services/storageService');

// @desc    Upload single product image
// @route   POST /api/upload
// @access  Private/Admin
const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const result = await storageService.uploadImage(req.file);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple product images
// @route   POST /api/upload/multiple
// @access  Private/Admin
const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select image files to upload' });
    }

    if (req.files.length > 8) {
      return res.status(400).json({ success: false, message: 'You can upload a maximum of 8 images at a time' });
    }

    // Concurrently upload images to cloud/storage
    const uploadPromises = req.files.map((file) => storageService.uploadImage(file));
    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product image from cloud storage
// @route   DELETE /api/upload
// @access  Private/Admin
const deleteImage = async (req, res, next) => {
  try {
    const { public_id, url } = req.body;
    const identifier = public_id || url;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide public_id or image url to delete' });
    }

    const deleted = await storageService.deleteImage(identifier);

    res.json({
      success: true,
      message: deleted ? 'Image deleted successfully' : 'Image not found or already removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Replace an existing product image
// @route   POST /api/upload/replace
// @access  Private/Admin
const replaceImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a replacement image file' });
    }

    const { old_public_id, old_url } = req.body;
    const oldIdentifier = old_public_id || old_url;

    // 1. Delete old image if provided
    if (oldIdentifier) {
      await storageService.deleteImage(oldIdentifier);
    }

    // 2. Upload replacement image
    const result = await storageService.uploadImage(req.file);

    res.status(200).json({
      success: true,
      message: 'Image replaced successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteImage,
  replaceImage,
};
