import connectToDatabase from '@/lib/mongodb';
import Order, { IOrderItem, IShippingAddress } from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { RequestError } from '@/lib/requestSecurity';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { amountInPaise, assertPaymentMatches } from '@/lib/paymentValidation';

export interface ISerializedOrder {
  id: string; _id: string; orderNumber: string; userId: string;
  customer: { name: string; email: string; phone: string };
  shippingAddress: IShippingAddress; items: IOrderItem[];
  totalAmount: number; currency: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string; razorpayPaymentId?: string;
  paymentStatus: 'pending' | 'captured' | 'failed';
  fulfillmentIssue?: string; reservationExpiresAt?: string;
  createdAt: string; updatedAt: string;
}

function documentToOrder(doc: any): ISerializedOrder {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(obj._id), _id: String(obj._id), orderNumber: obj.orderNumber, userId: String(obj.userId),
    customer: { name: obj.customer.name, email: obj.customer.email, phone: obj.customer.phone },
    shippingAddress: { street: obj.shippingAddress.street, city: obj.shippingAddress.city,
      state: obj.shippingAddress.state, postalCode: obj.shippingAddress.postalCode, country: obj.shippingAddress.country },
    items: obj.items.map((i: IOrderItem) => ({ productId: String(i.productId), name: i.name, slug: i.slug,
      sku: i.sku, price: i.price, quantity: i.quantity, image: i.image })),
    totalAmount: obj.totalAmount, currency: obj.currency, status: obj.status,
    razorpayOrderId: obj.razorpayOrderId, razorpayPaymentId: obj.razorpayPaymentId,
    paymentStatus: obj.paymentStatus, fulfillmentIssue: obj.fulfillmentIssue,
    reservationExpiresAt: obj.reservationExpiresAt?.toISOString(),
    createdAt: obj.createdAt.toISOString(), updatedAt: obj.updatedAt.toISOString(),
  };
}

async function database() {
  if (!await connectToDatabase()) throw new Error('Checkout requires a durable MongoDB connection.');
}

async function expireReservations(productId: string, session: mongoose.ClientSession) {
  const expired = await Order.find({ 'items.productId': productId, reservationActive: true,
    reservationExpiresAt: { $lte: new Date() }, paymentStatus: 'pending' }).session(session);
  for (const order of expired) {
    await Product.updateOne({ _id: productId }, { $inc: { reservedStock: -order.items[0].quantity } }, { session });
    order.reservationActive = false;
    order.status = 'cancelled';
    await order.save({ session });
  }
}

export async function createPendingOrder(params: {
  userId: string; customer: { name: string; email: string; phone: string };
  shippingAddress: IShippingAddress; productId: string; requestId: string;
}): Promise<ISerializedOrder> {
  await database();
  const session = await mongoose.startSession();
  try {
    let result!: ISerializedOrder;
    await session.withTransaction(async () => {
      // Serialize this customer's checkout attempts across products and instances.
      const customer = await User.updateOne({ _id: params.userId }, { $inc: { checkoutVersion: 1 } }, { session });
      if (customer.matchedCount !== 1) throw new RequestError('Please sign in again.', 401);
      const existing = await Order.findOne({ userId: params.userId, requestId: params.requestId }).session(session);
      if (existing) {
        assertCheckoutRetry(existing, params);
        result = documentToOrder(existing); return;
      }
      const active = await Order.findOne({ userId: params.userId, reservationActive: true,
        paymentStatus: 'pending', reservationExpiresAt: { $gt: new Date() } }).session(session);
      if (active) {
        assertCheckoutRetry(active, params);
        result = documentToOrder(active); return;
      }
      const recentHolds = await Order.countDocuments({ userId: params.userId, paymentStatus: 'pending',
        createdAt: { $gte: new Date(Date.now() - 60 * 60_000) } }).session(session);
      if (recentHolds >= 3) throw new RequestError('Too many unpaid checkouts. Please wait an hour or contact support.', 429, 3600);
      await expireReservations(params.productId, session);
      const product = await Product.findOneAndUpdate({ _id: params.productId, status: 'active',
        availability: 'in_stock', currency: 'INR',
        $expr: { $gte: [{ $subtract: ['$stock', { $ifNull: ['$reservedStock', 0] }] }, 1] },
      }, { $inc: { reservedStock: 1 } }, { new: true, session });
      if (!product || !Number.isInteger(product.stock)) throw new Error('This watch is unavailable or currently held in another checkout.');
      const amount = amountInPaise(product.price);
      const [order] = await Order.create([{
        orderNumber: `QT-${new Date().getUTCFullYear()}-${randomUUID()}`,
        userId: params.userId, requestId: params.requestId, customer: params.customer,
        shippingAddress: params.shippingAddress,
        items: [{ productId: String(product._id), name: product.name, slug: product.slug, sku: product.sku,
          price: amount / 100, quantity: 1, image: product.images.find(i => i.isPrimary)?.url || product.images[0]?.url || '' }],
        totalAmount: amount / 100, currency: 'INR', status: 'pending', paymentStatus: 'pending',
        reservationActive: true, reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      }], { session });
      result = documentToOrder(order);
    });
    return result;
  } finally { await session.endSession(); }
}

function assertCheckoutRetry(order: any, params: { productId: string; customer: { phone: string }; shippingAddress: IShippingAddress }) {
  if (order.items[0]?.productId !== params.productId) throw new RequestError('You already have a checkout for another watch. Complete it or wait for its hold to expire.', 409);
  const fields: (keyof IShippingAddress)[] = ['street', 'city', 'state', 'postalCode', 'country'];
  if (order.customer.phone !== params.customer.phone || fields.some(key => order.shippingAddress[key] !== params.shippingAddress[key])) {
    throw new RequestError('An existing checkout uses different delivery details. Use its saved details in My Orders or wait for the hold to expire before changing them.', 409);
  }
}

export async function claimProviderCreation(orderId: string) {
  return !!await Order.findOneAndUpdate({ _id: orderId, providerCreationStarted: { $ne: true },
    status: 'pending', reservationExpiresAt: { $gt: new Date() } }, { providerCreationStarted: true });
}

export async function attachRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  await database();
  const result = await Order.updateOne({ _id: orderId, razorpayOrderId: { $exists: false } }, { razorpayOrderId });
  if (result.modifiedCount !== 1) throw new Error('Could not attach provider order. Contact support.');
}

export async function fulfillOrder(payment: {
  id: string; order_id: string; amount: number; currency: string; status: string;
}): Promise<ISerializedOrder> {
  await database();
  const session = await mongoose.startSession();
  try {
    let result!: ISerializedOrder;
    await session.withTransaction(async () => {
      if (!payment || typeof payment.order_id !== 'string') throw new Error('Invalid payment.');
      const order = await Order.findOne({ razorpayOrderId: payment.order_id }).session(session);
      if (!order) throw new Error('Payment order not found.');
      assertPaymentMatches(order, payment);
      if (order.paymentStatus === 'captured') {
        if (order.razorpayPaymentId !== payment.id) throw new Error('Order already has a different payment.');
        result = documentToOrder(order); return;
      }
      const item = order.items[0];
      if (order.items.length !== 1 || item.quantity !== 1) throw new Error('Unsupported legacy order: manual reconciliation required.');
      const product = await Product.findOneAndUpdate({ _id: item.productId, status: 'active', availability: 'in_stock',
        $expr: { $gte: [order.reservationActive ? '$stock' :
          { $subtract: ['$stock', { $ifNull: ['$reservedStock', 0] }] }, item.quantity] },
      }, { $inc: { stock: -item.quantity, ...(order.reservationActive ? { reservedStock: -item.quantity } : {}) } },
      { new: true, session });
      if (product) {
        if (product.stock === 0) await Product.updateOne({ _id: product._id }, { availability: 'sold_out' }, { session });
        order.status = 'paid';
      } else {
        if (order.reservationActive) await Product.updateOne({ _id: item.productId }, { $inc: { reservedStock: -item.quantity } }, { session });
        order.fulfillmentIssue = 'Payment received but stock is unavailable. Admin must reconcile or refund in Razorpay.';
        order.status = 'processing';
      }
      order.reservationActive = false;
      order.paymentStatus = 'captured';
      order.razorpayPaymentId = payment.id;
      await order.save({ session });
      result = documentToOrder(order);
    });
    return result;
  } finally { await session.endSession(); }
}

export async function getOrderById(orderId: string): Promise<ISerializedOrder | null> {
  await database();
  if (!mongoose.isValidObjectId(orderId)) return null;
  const doc = await Order.findById(orderId).lean();
  return doc ? documentToOrder(doc) : null;
}

export async function getOrdersByUserId(userId: string): Promise<ISerializedOrder[]> {
  await database();
  return (await Order.find({ userId }).sort({ createdAt: -1 }).lean()).map(documentToOrder);
}

export async function getAllOrdersForAdmin(): Promise<ISerializedOrder[]> {
  if (!await connectToDatabase()) return [];
  return (await Order.find({}).sort({ createdAt: -1 }).limit(500).lean()).map(documentToOrder);
}

export async function updateOrderStatus(orderId: string, status: string): Promise<ISerializedOrder | null> {
  await database();
  const previous: Record<string, ISerializedOrder['status']> = { processing: 'paid', shipped: 'processing', delivered: 'shipped' };
  if (!Object.hasOwn(previous, status)) throw new Error('Only paid → processing → shipped → delivered transitions are supported. Refunds require Razorpay reconciliation.');
  if (!mongoose.isValidObjectId(orderId)) return null;
  const doc = await Order.findOneAndUpdate({ _id: orderId, status: previous[status], paymentStatus: 'captured',
    fulfillmentIssue: { $exists: false } }, { status: status as ISerializedOrder['status'] }, { new: true, runValidators: true });
  if (!doc) throw new Error('Order cannot transition to this status. Refresh and check its payment status.');
  return documentToOrder(doc);
}
