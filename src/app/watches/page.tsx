import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getProducts } from '@/services/productService';
import { CatalogueFiltersData, CatalogueResults, CatalogueSummary } from '@/components/catalogue/CatalogueData';
import { CatalogueHeaderSkeleton, FilterSkeleton, ProductGridSkeleton } from '@/components/common/LoadingSkeletons';

export interface WatchesPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    movement?: string;
    availability?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: 'featured' | 'newest' | 'price-low' | 'price-high';
    search?: string;
  }>;
}

export async function generateMetadata({ searchParams }: WatchesPageProps): Promise<Metadata> {
  const query = await searchParams;
  if (query.category && query.category !== 'all') {
    const formatted = query.category.charAt(0).toUpperCase() + query.category.slice(1);
    return {
      title: `${formatted} Watches | Quartz Times`,
      description: `Explore our ${formatted} watch collection with direct WhatsApp assistance.`,
    };
  }

  if (query.search) {
    return {
      title: `Search: "${query.search}" | Quartz Times`,
      description: `Search results for "${query.search}" in our watch collection.`,
    };
  }

  return {
    title: 'Watch Collection | Quartz Times',
    description: 'Browse stylish, dependable watches at transparent prices with helpful WhatsApp support.',
  };
}

export default async function WatchesPage({ searchParams }: WatchesPageProps) {
  const query = await searchParams;
  const queryKey = JSON.stringify(query);
  const productsPromise = getProducts({
    category: query.category,
    brand: query.brand,
    movement: query.movement,
    availability: query.availability,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    sort: query.sort,
    search: query.search,
    page: 1,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 transition-colors dark:bg-[#0A0A0B] dark:text-slate-100 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<CatalogueHeaderSkeleton />}>
          <CatalogueSummary productsPromise={productsPromise} />
        </Suspense>

        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
          <Suspense fallback={<FilterSkeleton />}>
            <CatalogueFiltersData />
          </Suspense>

          <div className="w-full flex-1">
            <Suspense key={queryKey} fallback={<ProductGridSkeleton count={6} />}>
              <CatalogueResults productsPromise={productsPromise} queryKey={queryKey} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
