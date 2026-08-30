import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Watch,
  Star,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  PlusCircle,
  Database,
  Cloud,
  ExternalLink,
} from 'lucide-react';
import { getAdminSession } from '@/lib/auth';
import { getProducts } from '@/services/productService';
import { getInquiries } from '@/services/inquiryService';
import { getCategories } from '@/services/categoryService';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [productsData, inquiriesData, categories] = await Promise.all([
    getProducts({ limit: 100, includeInactive: true }),
    getInquiries(10, 1),
    getCategories(false),
  ]);

  const allProducts = productsData.items;
  const totalCount = productsData.total;
  const activeCount = allProducts.filter((p) => p.status === 'active').length;
  const featuredCount = allProducts.filter((p) => p.featured).length;
  const soldOutCount = allProducts.filter((p) => p.availability === 'sold_out').length;

  const mongoConfigured = Boolean(process.env.MONGODB_URI);
  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-amber-600 dark:text-amber-400 font-semibold block">
            Admin Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 font-normal">
            Store Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Watch</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Total Watches
            </span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 shadow-sm dark:bg-slate-800 dark:text-amber-400 dark:border-transparent dark:shadow-none">
              <Watch className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Watches</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Featured on Home
            </span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 shadow-sm dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent dark:shadow-none">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">{featuredCount}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Featured</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Customer Inquiries
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/40 dark:shadow-none">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
              {inquiriesData.total}
            </span>
            {inquiriesData.unreadCount > 0 && (
              <span className="text-xs text-amber-400 font-semibold">
                ({inquiriesData.unreadCount} new)
              </span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Out of Stock
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-transparent dark:shadow-none">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">{soldOutCount}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Watches</span>
          </div>
        </div>
      </div>

      {/* System Status & Integrations Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          Service Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">MongoDB Database</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {mongoConfigured
                    ? 'Connected via Mongoose Atlas cluster'
                    : 'Using temporary demo data. Add MONGODB_URI to save changes permanently.'}
                </p>
              </div>
            </div>
            <Badge variant={mongoConfigured ? 'success' : 'warning'} size="sm">
              {mongoConfigured ? 'Connected' : 'Local Fallback'}
            </Badge>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Cloudinary Media CDN</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {cloudinaryConfigured
                    ? 'Cloudinary server-side SDK active'
                    : 'Using local media. Add Cloudinary credentials for cloud uploads.'}
                </p>
              </div>
            </div>
            <Badge variant={cloudinaryConfigured ? 'success' : 'warning'} size="sm">
              {cloudinaryConfigured ? 'Active CDN' : 'Local Fallback'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Recent Client Inquiries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Recent Customer Inquiries
          </h3>
          <Link
            href="/admin/inquiries"
            className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline"
          >
            View All ({inquiriesData.total}) →
          </Link>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Target Watch</th>
                <th className="py-3.5 px-4">Message</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {inquiriesData.items.slice(0, 5).map((inq) => (
                <tr key={inq.id || inq._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{inq.name}</td>
                  <td className="py-3 px-4 text-amber-600 dark:text-amber-400">{inq.product || 'General Inquiry'}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                    &ldquo;{inq.message}&rdquo;
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={inq.status === 'new' ? 'warning' : 'gold'} size="sm">
                      {inq.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {formatDate(inq.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
