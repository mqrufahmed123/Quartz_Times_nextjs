import crypto from 'node:crypto';

export function validSignature(body: string, signature: unknown, secret: string): boolean {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return crypto.timingSafeEqual(
    crypto.createHmac('sha256', secret).update(body).digest(),
    Buffer.from(signature, 'hex')
  );
}

export function amountInPaise(price: number): number {
  const amount = Math.round(price * 100);
  if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(amount) ||
      Math.abs(price * 100 - amount) > 0.00001) throw new Error('Invalid watch price.');
  return amount;
}

export function assertPaymentMatches(
  order: { razorpayOrderId?: string; totalAmount: number; currency: string },
  payment: { id: string; order_id: string; amount: number; currency: string; status: string }
) {
  if (!/^pay_[A-Za-z0-9]+$/.test(payment.id) || !order.razorpayOrderId ||
      payment.order_id !== order.razorpayOrderId || payment.amount !== amountInPaise(order.totalAmount) ||
      payment.currency !== order.currency || payment.status !== 'captured') {
    throw new Error('Captured payment does not match this order.');
  }
}

export function checkoutInput(body: any) {
  if (!body || typeof body.productId !== 'string' || !/^[a-f0-9]{24}$/i.test(body.productId)) {
    throw new Error('Select a persisted watch to purchase.');
  }
  if (body.quantity !== undefined && body.quantity !== 1) throw new Error('Buy Now supports one watch per order.');
  if (typeof body.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.requestId)) throw new Error('Invalid checkout request.');
  const a = body.shippingAddress;
  const text = (value: unknown, max: number) => {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error('Complete delivery address is required.');
    return value.trim();
  };
  const shippingAddress = {
    street: text(a?.street, 300), city: text(a?.city, 100), state: text(a?.state, 100),
    postalCode: text(a?.postalCode, 6), country: text(a?.country || 'India', 30),
  };
  if (!/^[1-9][0-9]{5}$/.test(shippingAddress.postalCode) || shippingAddress.country !== 'India') throw new Error('Enter a valid Indian delivery address and PIN code.');
  const phone = text(a?.phone, 20).replace(/[\s()-]/g, '');
  if (!/^\+?[0-9]{10,15}$/.test(phone)) throw new Error('Enter a valid contact phone number.');
  return { productId: body.productId, requestId: body.requestId, shippingAddress, phone };
}
