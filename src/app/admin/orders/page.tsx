import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getAllOrdersForAdmin } from '@/services/orderService';
import { OrderTable } from '@/components/admin/OrderTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOrdersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const orders = await getAllOrdersForAdmin();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
        <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
          E-Commerce Pipeline
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 font-bold">
          Customer Orders
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 hidden sm:block">
          Track customer watch acquisitions, Razorpay transaction IDs, and update fulfillment statuses.
        </p>
      </div>

      <OrderTable initialOrders={orders} />
    </div>
  );
}
