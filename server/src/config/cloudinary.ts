import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage for different document types
const createCloudinaryStorage = (folder: string, allowedFormats: string[]) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `urms/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    } as any,
  });
};

// Storage configurations for different document types
export const documentStorage = createCloudinaryStorage('documents', [
  'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'
]);

export const imageStorage = createCloudinaryStorage('images', [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'
]);

export const videoStorage = createCloudinaryStorage('videos', [
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'
]);

export const audioStorage = createCloudinaryStorage('audio', [
  'mp3', 'wav', 'ogg', 'aac', 'flac'
]);

// Multer configurations
export const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|rtf|odt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  }
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|svg/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

export const uploadAudio = multer({
  storage: audioStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|aac|flac/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Generic upload for any file type
export const uploadAny = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: 'urms/general',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      // ⚠️ removed allowed_formats to let Cloudinary decide
    }),
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});


// Utility functions
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export const getCloudinaryUrl = (publicId: string, options: any = {}) => {
  return cloudinary.url(publicId, options);
};

export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

export default cloudinary;