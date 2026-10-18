import { NextRequest, NextResponse } from 'next/server';
import { removeUserCookie } from '@/lib/userAuth';

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  await removeUserCookie();
  return NextResponse.json({ success: true });
}
