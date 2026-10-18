import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { updateOrderStatus } from '@/services/orderService';
import { revalidatePath } from 'next/cache';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();
    if (typeof status !== 'string' || !['processing', 'shipped', 'delivered'].includes(status)) return NextResponse.json({ error: 'Invalid fulfillment status.' }, { status: 400 });
    if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${id}`);
    revalidatePath('/account/orders');
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}
