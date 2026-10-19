import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store' };
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers });
  }

  return NextResponse.json({
    authenticated: true,
    user: { email: session.email, role: session.role },
  }, { headers });
}
