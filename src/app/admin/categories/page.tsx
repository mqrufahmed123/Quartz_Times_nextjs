import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getCategories } from '@/services/categoryService';
import { CategoryManager } from '@/components/admin/CategoryManager';

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const categories = await getCategories(false);

  return (
    <div className="space-y-8">
      <div className="border-b border-luxury-800 pb-6">
        <span className="text-[10px] uppercase tracking-ultra text-gold font-semibold block">
          Taxonomy
        </span>
        <h1 className="font-serif text-3xl text-luxury-100 font-normal">
          Horological Classifications & Categories
        </h1>
        <p className="text-xs text-luxury-400 mt-1">
          Define timepiece genres (Automatic, Chronograph, Quartz, Vintage, Dress, Diver).
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
