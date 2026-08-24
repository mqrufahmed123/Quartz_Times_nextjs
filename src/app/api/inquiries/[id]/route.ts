import { NextRequest, NextResponse } from 'next/server';
import { updateInquiryStatus } from '@/services/inquiryService';
import { getAdminSession } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, notes } = await req.json();
    const updated = await updateInquiryStatus(params.id, status, notes);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
