import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getCategories } from '@/services/categoryService';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function AdminNewProductPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const categories = await getCategories(false);

  return <ProductForm categories={categories} isEdit={false} />;
}
