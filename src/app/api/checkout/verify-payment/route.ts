import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/userAuth';
import { getOrderById } from '@/services/orderService';
import { validSignature } from '@/lib/paymentValidation';
import { razorpayConfig } from '@/lib/razorpay';
import { readJson, requestErrorResponse, requireSameOrigin } from '@/lib/requestSecurity';

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  try {
    requireSameOrigin(req);
    const body = await readJson(req);
    if (typeof body.localOrderId !== 'string' || typeof body.razorpayPaymentId !== 'string' || !/^pay_[A-Za-z0-9]+$/.test(body.razorpayPaymentId)) return NextResponse.json({ error: 'Invalid verification payload.' }, { status: 400 });
    const order = await getOrderById(body.localOrderId);
    if (!order || order.userId !== session.userId) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    const { secret } = razorpayConfig();
    if (!order.razorpayOrderId || order.razorpayOrderId !== body.razorpayOrderId ||
        !validSignature(`${order.razorpayOrderId}|${body.razorpayPaymentId}`, body.razorpaySignature, secret)) {
      return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
    }
    // The signed webhook is the authority for capture and fulfillment.
    return NextResponse.json({ success: true, orderId: order.id, paymentStatus: order.paymentStatus });
  } catch (err) {
    return requestErrorResponse(err, 'Unable to verify payment. Check My Orders or contact support.');
  }
}
