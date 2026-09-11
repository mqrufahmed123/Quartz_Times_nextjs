import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getHeroSettings, updateHeroSettings } from '@/services/heroSettingsService';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const settings = await getHeroSettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateHeroSettings(body);

    revalidatePath('/');
    revalidatePath('/admin/hero');

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
