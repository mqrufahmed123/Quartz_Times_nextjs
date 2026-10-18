'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  Loader2,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { ISerializedOrder } from '@/services/orderService';
import { formatPrice } from '@/lib/utils';

export interface OrderTableProps {
  initialOrders: ISerializedOrder[];
}

export const OrderTable: React.FC<OrderTableProps> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<ISerializedOrder[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unable to update order.');
      } else {
        const updated = await res.json();
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update order.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Order / Reference</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Watch Purchased</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No orders have been recorded in the vault yet.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const isPaid = ord.paymentStatus === 'captured';
                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {ord.customer.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{ord.customer.email}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {ord.customer.phone}
                          </p>
                          <div className="text-[11px] text-slate-500 line-clamp-2 max-w-xs pt-1">
                            {ord.shippingAddress.street}, {ord.shippingAddress.city},{' '}
                            {ord.shippingAddress.state} - {ord.shippingAddress.postalCode}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-2">
                          {ord.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {item.name}
                                </p>
                                <span className="text-[10px] font-mono text-slate-400">
                                  Ref: {item.sku} (Qty: {item.quantity})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="font-serif font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {formatPrice(ord.totalAmount, ord.currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                          {ord.razorpayPaymentId && (
                            <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[140px]">
                              {ord.razorpayPaymentId}
                            </span>
                          )}
                          {ord.fulfillmentIssue && <p role="alert" className="max-w-xs text-red-600 dark:text-red-400">{ord.fulfillmentIssue}</p>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <select
                            value={ord.status}
                            disabled={updatingId === ord.id || !isPaid || !!ord.fulfillmentIssue || ord.status === 'delivered'}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                          >
                            <option value={ord.status}>{ord.status}</option>
                            {ord.status === 'paid' && <option value="processing">Processing</option>}
                            {ord.status === 'processing' && <option value="shipped">Shipped</option>}
                            {ord.status === 'shipped' && <option value="delivered">Delivered</option>}
                          </select>
                          {updatingId === ord.id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
