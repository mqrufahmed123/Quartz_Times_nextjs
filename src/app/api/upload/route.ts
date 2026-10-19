import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAdminSession } from '@/lib/auth';
import { getBrowserImageUrl } from '@/lib/imageDelivery';
import { downloadRemoteImage, RemoteImageError } from '@/lib/remoteImage';

export const runtime = 'nodejs';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 30 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    let file: File | null;
    let type = 'image';
    if (req.headers?.get('content-type')?.split(';')[0].trim().toLowerCase() === 'application/json') {
      const body = await req.json().catch(() => null);
      if (!body || typeof body.imageUrl !== 'string' || !body.imageUrl.trim() || body.imageUrl.length > 8192) {
        return NextResponse.json({ error: 'Drop an image with a direct public image URL.' }, { status: 400 });
      }
      file = await downloadRemoteImage(body.imageUrl.trim());
    } else {
      const formData = await req.formData();
      file = formData.get('file') as File | null;
      type = (formData.get('type') as string) || 'image';
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = type === 'video';
    let isHeic = !isVideo && (/^image\/hei[cf](?:-sequence)?$/i.test(file.type) || /\.(heic|heif)$/i.test(file.name));
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    // Some desktop browsers leave HEIC's MIME type empty or use octet-stream.
    const untypedHeic = isHeic && (!file.type || file.type === 'application/octet-stream');
    if (!allowedTypes.has(file.type) && !untypedHeic) {
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
    if (!isVideo && buffer.toString('ascii', 4, 8) === 'ftyp') {
      const brands = buffer.toString('ascii', 8, 64);
      isHeic = isHeic || /heic|heix|hevc|hevx|heim|heis/.test(brands);
    }

    // If Cloudinary credentials exist, upload directly to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadRes = await uploadToCloudinary(buffer, {
        folder: 'quartz-times/watches',
        resourceType: isVideo ? 'video' : 'image',
        filename: randomUUID(),
        outputFormat: isHeic ? 'jpg' : undefined,
      });

      return NextResponse.json({
        url: isVideo ? (uploadRes.secure_url || uploadRes.url) : getBrowserImageUrl(uploadRes.secure_url || uploadRes.url),
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

    if (isHeic) {
      return NextResponse.json(
        { error: 'HEIC photos need Cloudinary conversion. Configure Cloudinary or upload a JPG, PNG, or WebP photo.' },
        { status: 503 }
      );
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
    if (err instanceof RemoteImageError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
