import React from 'react';
import { Metadata } from 'next';
import {
  getProducts,
  getDistinctBrands,
  getDistinctMovements,
} from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { CatalogueHeader } from '@/components/catalogue/CatalogueHeader';
import { ProductFilters } from '@/components/catalogue/ProductFilters';
import { ProductGrid } from '@/components/catalogue/ProductGrid';

export interface WatchesPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    movement?: string;
    availability?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: 'featured' | 'newest' | 'price-low' | 'price-high';
    search?: string;
    page?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: WatchesPageProps): Promise<Metadata> {
  const category = searchParams.category;
  const search = searchParams.search;

  if (category && category !== 'all') {
    const formatted = category.charAt(0).toUpperCase() + category.slice(1);
    return {
      title: `${formatted} Watches | Quartz Times`,
      description: `Explore our collection of authentic ${formatted} watches with free shipping and direct WhatsApp assistance.`,
    };
  }

  if (search) {
    return {
      title: `Search: "${search}" | Quartz Times`,
      description: `Search results for "${search}" in our watch collection.`,
    };
  }

  return {
    title: 'Watch Collection | Quartz Times',
    description:
      'Browse our complete collection of 100% authentic luxury and performance watches. Rolex, Omega, Audemars Piguet, Patek Philippe, Seiko, and more.',
  };
}

export default async function WatchesPage({ searchParams }: WatchesPageProps) {
  const [productsData, categories, brands, movements] = await Promise.all([
    getProducts({
      category: searchParams.category,
      brand: searchParams.brand,
      movement: searchParams.movement,
      availability: searchParams.availability,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      sort: searchParams.sort,
      search: searchParams.search,
      page: searchParams.page ? Number(searchParams.page) : 1,
      limit: 24,
    }),
    getCategories(false),
    getDistinctBrands(),
    getDistinctMovements(),
  ]);

  return (
    <div className="py-10 sm:py-16 bg-slate-50 dark:bg-[#0A0A0B] min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CatalogueHeader total={productsData.total} />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Filter Sidebar */}
          <ProductFilters
            categories={categories}
            brands={brands}
            movements={movements}
          />

          {/* Product Grid */}
          <div className="flex-1 w-full">
            <ProductGrid
              products={productsData.items}
              emptyTitle="No Watches Found"
              emptyDescription="No watches match your selected filters. Try resetting filters or searching for another model."
              resetUrl="/watches"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
