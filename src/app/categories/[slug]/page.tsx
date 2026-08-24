import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCategoryBySlug, getCategories } from '@/services/categoryService';
import { getProducts, getDistinctBrands, getDistinctMovements } from '@/services/productService';
import { CatalogueHeader } from '@/components/catalogue/CatalogueHeader';
import { ProductFilters } from '@/components/catalogue/ProductFilters';
import { ProductGrid } from '@/components/catalogue/ProductGrid';

export interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    brand?: string;
    movement?: string;
    availability?: string;
    sort?: 'featured' | 'newest' | 'price-low' | 'price-high';
    page?: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    return { title: 'Category Not Found | Quartz Times' };
  }

  return {
    title: `${category.name} Watches | Quartz Times Horology`,
    description: `${category.description} Certified authentic luxury timepieces.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  const [productsData, categories, brands, movements] = await Promise.all([
    getProducts({
      category: category.slug,
      brand: searchParams.brand,
      movement: searchParams.movement,
      availability: searchParams.availability,
      sort: searchParams.sort,
      page: searchParams.page ? Number(searchParams.page) : 1,
      limit: 24,
    }),
    getCategories(false),
    getDistinctBrands(),
    getDistinctMovements(),
  ]);

  return (
    <div className="py-10 sm:py-16 bg-luxury-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <CatalogueHeader
          total={productsData.total}
          categoryName={`${category.name} Timepieces`}
        />

        <p className="text-xs sm:text-sm text-luxury-400 max-w-2xl font-light -mt-4">
          {category.description}
        </p>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start pt-4">
          <ProductFilters
            categories={categories}
            brands={brands}
            movements={movements}
          />

          <div className="flex-1 w-full">
            <ProductGrid
              products={productsData.items}
              emptyTitle={`No ${category.name} Timepieces Found`}
              emptyDescription="No watches currently match your selected filters in this classification."
              resetUrl={`/categories/${category.slug}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
