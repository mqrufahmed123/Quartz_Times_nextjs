import { NextRequest, NextResponse } from 'next/server';
import { updateInquiryStatus } from '@/services/inquiryService';
import { getAdminSession } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, notes } = await req.json();
    if (!['new', 'contacted', 'converted', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid inquiry status' }, { status: 400 });
    }
    const updated = await updateInquiryStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
