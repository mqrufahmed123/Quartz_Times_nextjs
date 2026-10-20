import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getCategories } from '@/services/categoryService';
import { CategoryManager } from '@/components/admin/CategoryManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const categories = await getCategories(false);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="text-[10px] uppercase tracking-ultra text-amber-600 dark:text-amber-400 font-semibold block">
          Taxonomy
        </span>
        <h1 className="font-serif text-3xl text-slate-900 dark:text-slate-100 font-normal">
          Product Categories
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Create and manage the categories customers use to browse products.
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
