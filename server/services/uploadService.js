import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary is configured
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️ Cloudinary image storage configured');
} else {
  console.log('📁 Local secure storage configured for images (Cloudinary credentials not detected)');
}

// Multer disk storage (used for both staging before Cloudinary upload and local fallback storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `journey-photo-${uniqueSuffix}${ext}`);
  },
});

// File filter: accept JPG, PNG, WebP, HEIC/HEIF
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/octet-stream', // Some HEIC files are uploaded with this mime type
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload JPG, PNG, WebP, or HEIC images.'), false);
  }
};

// Maximum upload size: 5 MB
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

/**
 * Process uploaded file to Cloudinary if configured, or keep in local storage
 */
export const processUploadedFile = async (file, userId) => {
  if (!file) return null;

  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `mosaic_wellness/users/${userId}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      // Remove temporary local file after Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        storageType: 'cloudinary',
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback to local file if Cloudinary fails
    }
  }

  // Local storage return: served via protected API endpoint
  const localUrl = `/api/photos/file/${file.filename}`;
  return {
    url: localUrl,
    publicId: file.filename,
    storageType: 'local',
  };
};

/**
 * Delete image from Cloudinary or local disk
 */
export const deleteStoredFile = async (publicId, storageType = 'local') => {
  if (!publicId) return;

  if (storageType === 'cloudinary' && hasCloudinary) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return;
    } catch (err) {
      console.error('Error deleting from Cloudinary:', err.message);
    }
  }

  // Delete local file
  const localPath = path.join(uploadsDir, publicId);
  if (fs.existsSync(localPath)) {
    try {
      fs.unlinkSync(localPath);
    } catch (err) {
      console.error('Error deleting local file:', err.message);
    }
  }
};
