import { NextRequest, NextResponse } from 'next/server';
import { createInquiry, getInquiries } from '@/services/inquiryService';
import { getAdminSession } from '@/lib/auth';
import { readJson, requestErrorResponse, requireSameOrigin } from '@/lib/requestSecurity';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const data = await getInquiries(limit, page, status);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireSameOrigin(req);
    await enforceRateLimit('inquiry-global', 'all', 60, 60_000);
    const body = await readJson(req);
    if (!body.name || !body.phone || !body.message) {
      return NextResponse.json(
        { error: 'Name, phone, and message are required.' },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry(body);
    return NextResponse.json(inquiry, { status: 201 });
  } catch (err: any) {
    return requestErrorResponse(err);
  }
}
