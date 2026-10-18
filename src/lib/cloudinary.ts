import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure server-side Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export { cloudinary };

export interface CloudinaryOptimizedOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'pad' | 'thumb';
  quality?: string | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  aspectRatio?: string;
}

/**
 * Generates an optimized Cloudinary delivery URL with automatic format and quality compression
 */
export function getOptimizedImageUrl(
  urlOrPublicId: string,
  options: CloudinaryOptimizedOptions = {}
): string {
  if (!urlOrPublicId) return '';

  // If it's already an external non-cloudinary URL (e.g. initial demo photo or local asset), return as is
  if (!urlOrPublicId.includes('cloudinary.com') && !process.env.CLOUDINARY_CLOUD_NAME) {
    return urlOrPublicId;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
    aspectRatio,
  } = options;

  // If it's a full Cloudinary URL, we can inject transformation parameters
  if (urlOrPublicId.includes('res.cloudinary.com')) {
    const uploadIndex = urlOrPublicId.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const transformations = [
        `f_${format}`,
        `q_${quality}`,
        width ? `w_${width}` : null,
        height ? `h_${height}` : null,
        crop ? `c_${crop}` : null,
        aspectRatio ? `ar_${aspectRatio}` : null,
      ]
        .filter(Boolean)
        .join(',');

      return urlOrPublicId.replace('/upload/', `/upload/${transformations}/`);
    }
    return urlOrPublicId;
  }

  // If it's a publicId and cloud name is configured
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return cloudinary.url(urlOrPublicId, {
      fetch_format: format,
      quality: quality,
      width,
      height,
      crop,
      aspect_ratio: aspectRatio,
      secure: true,
    });
  }

  return urlOrPublicId;
}

/**
 * Generates video poster thumbnail from a Cloudinary video public ID or URL
 */
export function getVideoThumbnail(videoUrlOrPublicId: string): string {
  if (!videoUrlOrPublicId) return '';
  if (videoUrlOrPublicId.includes('res.cloudinary.com')) {
    // replace video extension or add jpg format
    return videoUrlOrPublicId
      .replace(/\.(mp4|mov|webm|mkv)$/i, '.jpg')
      .replace('/video/upload/', '/video/upload/so_0,f_auto,q_auto/');
  }
  return videoUrlOrPublicId;
}

/**
 * Server-side helper to upload buffer to Cloudinary (handles HEIC, MOV, PNG, JPG)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'auto';
    filename?: string;
  } = {}
): Promise<UploadApiResponse> {
  const { folder = 'quartz-times/watches', resourceType = 'auto', filename } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
        overwrite: true,
        // Cloudinary handles HEIC conversion automatically when requested in standard formats
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}
