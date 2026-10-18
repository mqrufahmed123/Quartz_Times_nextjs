import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/userAuth';
import { createPendingOrder, claimProviderCreation, attachRazorpayOrderId } from '@/services/orderService';
import { checkoutInput, amountInPaise } from '@/lib/paymentValidation';
import { razorpayConfig, razorpayRequest } from '@/lib/razorpay';
import { readJson, requestErrorResponse, requireSameOrigin } from '@/lib/requestSecurity';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Please sign in to purchase.' }, { status: 401 });
  let input;
  try {
    requireSameOrigin(req);
    await enforceRateLimit('checkout-account', session.userId, 20, 15 * 60_000);
    const body = await readJson(req);
    try { input = checkoutInput(body); }
    catch (err) { return NextResponse.json({ error: (err as Error).message }, { status: 400 }); }
  } catch (err) { return requestErrorResponse(err); }
  try {
    const { keyId } = razorpayConfig();
    const localOrder = await createPendingOrder({ ...input, userId: session.userId,
      customer: { name: session.name, email: session.email, phone: input.phone } });
    if (localOrder.status !== 'pending' || !localOrder.reservationExpiresAt || Date.parse(localOrder.reservationExpiresAt) <= Date.now()) {
      return NextResponse.json({ error: 'Checkout expired or completed. Close and reopen checkout.', orderId: localOrder.id }, { status: 409 });
    }
    let providerId = localOrder.razorpayOrderId;
    if (!providerId) {
      if (!await claimProviderCreation(localOrder.id)) return NextResponse.json({ error: 'Order is being prepared or requires reconciliation. Check My Orders before retrying.', orderId: localOrder.id }, { status: 409 });
      const provider = await razorpayRequest('orders', { amount: amountInPaise(localOrder.totalAmount), currency: 'INR',
        receipt: localOrder.id, notes: { localOrderId: localOrder.id } });
      if (!/^order_[A-Za-z0-9]+$/.test(provider.id) || provider.amount !== amountInPaise(localOrder.totalAmount) || provider.currency !== 'INR') throw new Error('Invalid payment provider response.');
      providerId = provider.id;
      await attachRazorpayOrderId(localOrder.id, provider.id);
    }
    return NextResponse.json({ localOrder, keyId, razorpayOrder: { id: providerId, amount: amountInPaise(localOrder.totalAmount), currency: 'INR' } });
  } catch (err) {
    return requestErrorResponse(err, 'Checkout could not be prepared. The watch may be held or unavailable. Check My Orders before retrying; holds expire after 15 minutes.');
  }
}
