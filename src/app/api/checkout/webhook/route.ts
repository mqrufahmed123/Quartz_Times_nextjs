import { NextRequest, NextResponse } from 'next/server';
import { validSignature } from '@/lib/paymentValidation';
import { fulfillOrder } from '@/services/orderService';
import { revalidatePath, revalidateTag } from 'next/cache';
import { readLimitedText, requestErrorResponse } from '@/lib/requestSecurity';

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  let raw;
  try { raw = await readLimitedText(req, 256 * 1024); }
  catch (err) { return requestErrorResponse(err); }
  if (!validSignature(raw, req.headers.get('x-razorpay-signature'), secret)) return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  let event;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  if (!event || typeof event !== 'object') return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
  if (event.event !== 'payment.captured' && event.event !== 'order.paid') return NextResponse.json({ received: true });
  try {
    const order = await fulfillOrder(event.payload?.payment?.entity);
    revalidateTag('catalogue-filters', 'max');
    for (const path of ['/', '/watches', '/admin/orders', '/admin/products', '/account/orders', `/orders/${order.id}`, ...order.items.map(i => `/watches/${i.slug}`)]) revalidatePath(path);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Payment requires retry or reconciliation.' }, { status: 503 });
  }
}
