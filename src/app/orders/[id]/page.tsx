import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getUserSession } from '@/lib/userAuth';
import { OrderRefresh } from '@/components/common/OrderRefresh';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getOrderById } from '@/services/orderService';
import { formatPrice } from '@/lib/utils';

export interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { id } = await params;
  const session = await getUserSession();
  if (!session) redirect('/login');
  const order = await getOrderById(id);

  if (!order || order.userId !== session.userId) {
    notFound();
  }

  const isPaid = order.paymentStatus === 'captured';

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070708] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Status Header */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase tracking-ultra text-amber-600 dark:text-amber-400 font-bold block">
            {order.fulfillmentIssue ? 'Order requires review' : isPaid ? 'Payment confirmed' : 'Awaiting payment confirmation'}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isPaid ? 'Thank you for your order' : 'Your order details'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {order.fulfillmentIssue ? 'Your payment was received, but availability needs review. Please contact us with your order reference.' : isPaid ? 'Your payment has been verified. You can follow fulfillment progress in My Orders.' : 'Payment has not yet been confirmed. If you have paid, allow a moment for confirmation and avoid paying again.'}
          </p>
          <OrderRefresh pending={!isPaid && order.status === 'pending'} />
          <p className="text-xs text-slate-500">Order status: {order.status}</p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Order: <span className="font-bold text-amber-600 dark:text-amber-400">{order.orderNumber}</span>
            </div>
            {order.razorpayPaymentId && (
              <div className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                Razorpay ID: <span className="font-bold">{order.razorpayPaymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchased Watches */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Watch Purchased
            </h3>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Ref / SKU: {item.sku}
                    </span>
                    <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-serif text-slate-900 dark:text-slate-100">
                      {formatPrice(item.price * item.quantity, order.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-600 dark:text-slate-400">{isPaid ? 'Total Paid' : 'Order Total'}</span>
              <span className="font-serif text-lg text-amber-600 dark:text-amber-400">
                {formatPrice(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>

          {/* Delivery & Assurance */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Delivery Information
            </h3>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {order.customer.name}
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-1 text-slate-400">Phone: {order.customer.phone}</p>
              <p className="text-slate-400">Email: {order.customer.email}</p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Delivery to the address provided at checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Dispatch details will be confirmed by our team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            href="/watches"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-center transition-colors"
          >
            Continue Browsing
          </Link>
          <Link
            href="/account/orders"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <span>View All My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
