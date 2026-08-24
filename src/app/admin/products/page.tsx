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
    <div className="space-y-8">
      <div className="border-b border-luxury-800 pb-6">
        <span className="text-[10px] uppercase tracking-ultra text-gold font-semibold block">
          Inventory Control
        </span>
        <h1 className="font-serif text-3xl text-luxury-100 font-normal">
          Timepiece Vault Management
        </h1>
        <p className="text-xs text-luxury-400 mt-1">
          Manage listings, toggle featured curations, inspect photography, and edit specifications.
        </p>
      </div>

      <ProductTable initialProducts={productsData.items} />
    </div>
  );
}
