const multer = require('multer');
const path = require('path');

// Memory storage keeps file buffers in memory for direct cloud streaming
const storage = multer.memoryStorage();

// File type validator
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|svg/;
  const allowedMimeTypes = /^image\/(jpeg|png|webp|gif|svg\+xml)$/;

  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${file.mimetype}". Only image files (JPG, PNG, WebP, GIF, SVG) are allowed!`
      ),
      false
    );
  }
};

// Multer instance with 5MB max file size limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 8,                  // Max 8 images per upload batch
  },
  fileFilter,
});

module.exports = upload;
