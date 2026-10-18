import { RequestError } from '@/lib/requestSecurity';

export function inquiryInput(body: Record<string, any>) {
  const text = (name: string, max: number, required = false) => {
    const value = body[name] ?? '';
    if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
      throw new RequestError(`Invalid ${name}.`);
    }
    return value.trim();
  };
  const email = text('email', 254).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError('Invalid email.');
  const phone = text('phone', 30, true).replace(/[\s()-]/g, '');
  if (!/^\+?\d{10,15}$/.test(phone)) throw new RequestError('Invalid phone.');
  return { name: text('name', 100, true), phone, email, message: text('message', 3000, true),
    product: text('product', 200), productId: text('productId', 100), productSku: text('productSku', 100),
    status: 'new' as const, notes: '' };
}
