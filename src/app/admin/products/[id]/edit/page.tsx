import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getProductById } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(false),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} categories={categories} isEdit={true} />;
}
