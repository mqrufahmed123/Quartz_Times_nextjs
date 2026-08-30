import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getProducts } from '@/services/productService';
import { ProductTable } from '@/components/admin/ProductTable';

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const productsData = await getProducts({ limit: 100 });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
        <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
          Inventory
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 font-bold">
          All Watches
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 hidden sm:block">
          Manage listings, update availability, edit prices, and update photos.
        </p>
      </div>

      <ProductTable initialProducts={productsData.items} />
    </div>
  );
}
