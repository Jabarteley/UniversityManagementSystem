import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

export const uploadAny = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: 'urms/general',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    }),
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default cloudinary;