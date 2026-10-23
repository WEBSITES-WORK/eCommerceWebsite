const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials are provided in environment
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Storage Service]: Cloudinary configured for cloud image storage.');
} else {
  console.log('[Storage Service]: Cloudinary credentials not detected; using optimized local storage with static serving.');
}

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload a single file buffer or disk file to Cloudinary or local storage
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Image metadata { url, public_id, size, storage }
 */
const uploadImage = async (file) => {
  if (!file) throw new Error('No file provided for upload');

  // 1. Cloudinary upload path if configured
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: 'novashop_products',
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error);
            // Fallback to local storage on Cloudinary network error
            saveLocally(file).then(resolve).catch(reject);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              size: result.bytes,
              width: result.width,
              height: result.height,
              storage: 'cloudinary',
            });
          }
        }
      );

      // Write memory buffer to Cloudinary stream
      uploadStream.end(file.buffer);
    });
  }

  // 2. Local storage fallback
  return saveLocally(file);
};

/**
 * Save file locally and return accessible URL
 */
const saveLocally = async (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `product-${uniqueSuffix}${ext}`;
  const targetPath = path.join(UPLOAD_DIR, filename);

  if (file.buffer) {
    await fs.promises.writeFile(targetPath, file.buffer);
  } else if (file.path) {
    await fs.promises.copyFile(file.path, targetPath);
  }

  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const url = `${serverUrl}/uploads/${filename}`;

  return {
    url,
    public_id: filename,
    filename,
    size: file.size || (file.buffer ? file.buffer.length : 0),
    storage: 'local',
  };
};

/**
 * Delete image from Cloudinary or local disk
 * @param {string} publicIdOrUrl - The public ID or URL of the image
 */
const deleteImage = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return false;

  try {
    // If it's a Cloudinary URL or public ID
    if (publicIdOrUrl.includes('res.cloudinary.com') || publicIdOrUrl.startsWith('novashop_products/')) {
      let publicId = publicIdOrUrl;
      if (publicIdOrUrl.includes('res.cloudinary.com')) {
        // Extract public ID from Cloudinary URL (e.g., .../upload/v12345/novashop_products/abc123.jpg)
        const parts = publicIdOrUrl.split('/');
        const uploadIdx = parts.indexOf('upload');
        if (uploadIdx !== -1) {
          // Remove version if present and file extension
          const relativeParts = parts.slice(uploadIdx + 1);
          if (relativeParts[0] && relativeParts[0].startsWith('v')) {
            relativeParts.shift();
          }
          publicId = relativeParts.join('/').replace(/\.[^/.]+$/, '');
        }
      }

      if (isCloudinaryConfigured) {
        await cloudinary.uploader.destroy(publicId);
        return true;
      }
    }

    // Local file deletion
    const filename = path.basename(publicIdOrUrl);
    const localPath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(localPath)) {
      await fs.promises.unlink(localPath);
      return true;
    }

    return true;
  } catch (err) {
    console.error('[Storage Service]: Error deleting image:', err);
    return false;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  isCloudinaryConfigured,
};
