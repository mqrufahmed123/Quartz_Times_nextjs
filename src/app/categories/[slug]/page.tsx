import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCategoryBySlug } from '@/services/categoryService';
import { getProducts } from '@/services/productService';
import { CatalogueFiltersData, CatalogueResults, CatalogueSummary } from '@/components/catalogue/CatalogueData';
import { CatalogueHeaderSkeleton, FilterSkeleton, ProductGridSkeleton } from '@/components/common/LoadingSkeletons';

export interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string;
    movement?: string;
    availability?: string;
    sort?: 'featured' | 'newest' | 'price-low' | 'price-high';
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found | Quartz Times' };

  return {
    title: `${category.name} Watches | Quartz Times`,
    description: category.description || `Browse ${category.name} watches from Quartz Times.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const queryKey = JSON.stringify({ ...query, category: category.slug });
  const productsPromise = getProducts({
    category: category.slug,
    brand: query.brand,
    movement: query.movement,
    availability: query.availability,
    sort: query.sort,
    page: 1,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 dark:bg-[#0A0A0B] dark:text-slate-100 sm:py-16">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<CatalogueHeaderSkeleton />}>
          <CatalogueSummary productsPromise={productsPromise} categoryName={`${category.name} Watches`} />
        </Suspense>

        {category.description && (
          <p className="-mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{category.description}</p>
        )}

        <div className="flex flex-col items-start gap-8 pt-4 lg:flex-row lg:gap-10">
          <Suspense fallback={<FilterSkeleton />}>
            <CatalogueFiltersData />
          </Suspense>

          <div className="w-full flex-1">
            <Suspense key={queryKey} fallback={<ProductGridSkeleton count={6} />}>
              <CatalogueResults
                productsPromise={productsPromise}
                queryKey={queryKey}
                baseQuery={{ category: category.slug }}
                emptyTitle={`No ${category.name} Watches Found`}
                emptyDescription="No watches currently match your selected filters."
                resetUrl={`/categories/${category.slug}`}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
