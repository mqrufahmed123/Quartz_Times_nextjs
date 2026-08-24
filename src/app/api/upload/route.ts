import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAdminSession } from '@/lib/auth';

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
        resourceType: type === 'video' ? 'video' : 'image',
        filename: file.name,
      });

      return NextResponse.json({
        url: uploadRes.secure_url || uploadRes.url,
        publicId: uploadRes.public_id,
        width: uploadRes.width,
        height: uploadRes.height,
        format: uploadRes.format,
        thumbnailUrl:
          type === 'video'
            ? (uploadRes.secure_url || uploadRes.url).replace(/\.[^/.]+$/, '.jpg')
            : undefined,
      });
    }

    // Fallback: convert to base64 Data URL for instant local demonstration if Cloudinary env is pending
    const mimeType = file.type || (type === 'video' ? 'video/mp4' : 'image/jpeg');
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
