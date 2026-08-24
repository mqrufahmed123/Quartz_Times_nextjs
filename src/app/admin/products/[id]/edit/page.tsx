import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getProductById } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function AdminEditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(false),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} categories={categories} isEdit={true} />;
}
