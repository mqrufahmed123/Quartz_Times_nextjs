import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 30 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = type === 'video';
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: `Unsupported ${isVideo ? 'video' : 'image'} format.` }, { status: 415 });
    }
    if (file.size <= 0 || file.size > maxSize) {
      return NextResponse.json(
        { error: `${isVideo ? 'Video' : 'Image'} must be smaller than ${maxSize / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary credentials exist, upload directly to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadRes = await uploadToCloudinary(buffer, {
        folder: 'quartz-times/watches',
        resourceType: isVideo ? 'video' : 'image',
        filename: file.name,
      });

      return NextResponse.json({
        url: uploadRes.secure_url || uploadRes.url,
        publicId: uploadRes.public_id,
        width: uploadRes.width,
        height: uploadRes.height,
        format: uploadRes.format,
        thumbnailUrl:
          isVideo
            ? (uploadRes.secure_url || uploadRes.url).replace(/\.[^/.]+$/, '.jpg')
            : undefined,
      });
    }

    // Fallback: convert to base64 Data URL for instant local demonstration if Cloudinary env is pending
    const mimeType = file.type;
    const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      url: base64,
      publicId: `local-${Date.now()}`,
      format: mimeType.split('/')[1] || 'jpeg',
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
