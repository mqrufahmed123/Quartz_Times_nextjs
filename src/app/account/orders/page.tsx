import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';
import { getUserSession } from '@/lib/userAuth';
import { getOrdersByUserId } from '@/services/orderService';
import { formatPrice } from '@/lib/utils';
import { SignOutButton } from '@/components/common/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const session = await getUserSession();
  if (!session) {
    redirect('/login?redirect=/account/orders');
  }

  const orders = await getOrdersByUserId(session.userId);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070708] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-serif font-bold text-lg">
              {session.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-ultra text-amber-600 dark:text-amber-400 font-bold block">
                Client Profile
              </span>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {session.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{session.email}</p>
            </div>
          </div>

          <SignOutButton />
        </div>

        {/* Orders List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Acquisition History ({orders.length})
            </h2>
            <Link
              href="/watches"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Boutique</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Package className="w-10 h-10 mx-auto text-slate-400" />
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                  No orders placed yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  When you acquire an authentic Swiss or Japanese watch from Quartz Times, your delivery tracking and receipts will appear here.
                </p>
              </div>
              <Link
                href="/watches"
                className="inline-block px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Browse Available Watches
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const isPaid = ord.paymentStatus === 'captured';
                return (
                  <div
                    key={ord.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950/40 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {ord.fulfillmentIssue ? 'Payment received — contact support' : isPaid ? `Paid · ${ord.status}` : ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {item.name}
                              </h4>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                Ref: {item.sku}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-serif font-bold text-slate-900 dark:text-slate-100">
                              {formatPrice(item.price * item.quantity, ord.currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        {ord.razorpayPaymentId && (
                          <span className="font-mono text-[11px] text-slate-400">
                            Payment Ref: {ord.razorpayPaymentId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-slate-400 mr-2">{isPaid ? 'Total Paid:' : 'Order Total:'}</span>
                          <span className="font-serif font-bold text-amber-600 dark:text-amber-400 text-sm">
                            {formatPrice(ord.totalAmount, ord.currency)}
                          </span>
                        </div>
                        <Link
                          href={`/orders/${ord.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
