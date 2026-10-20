import { CatalogueControls } from "@/components/catalogue/CatalogueControls";
import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCategoryBySlug } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import {
  CatalogueFiltersData,
  CatalogueResults,
  CatalogueSummary,
} from "@/components/catalogue/CatalogueData";
import {
  CatalogueHeaderSkeleton,
  FilterSkeleton,
  ProductGridSkeleton,
} from "@/components/common/LoadingSkeletons";

export interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    productType?: string;
    size?: string;
    color?: string;
    brand?: string;
    movement?: string;
    availability?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sort?: "featured" | "newest" | "price-low" | "price-high";
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found | Quartz Times" };

  return {
    title: `${category.name} | Quartz Times`,
    description:
      category.description ||
      `Browse ${category.name} products from Quartz Times.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const queryKey = JSON.stringify({ ...query, category: category.slug });
  const productsPromise = getProducts({
    category: category.slug,
    productType: query.productType,
    size: query.size,
    color: query.color,
    brand: query.brand,
    movement: query.movement,
    availability: query.availability,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    search: query.search,
    sort: query.sort,
    page: 1,
    limit: 12,
  });

  return (
    <CatalogueControls>
      <div className="qt-catalogue">
        <div className="qt-container">
          <Suspense fallback={<CatalogueHeaderSkeleton />}>
            <CatalogueSummary
              productsPromise={productsPromise}
              categoryName={`${category.name}`}
            />
          </Suspense>

          {category.description && (
            <p className="max-w-2xl text-sm qt-muted mb-6 leading-7">
              {category.description}
            </p>
          )}

          <div className="qt-catalogue-layout">
            <Suspense fallback={<FilterSkeleton />}>
              <CatalogueFiltersData />
            </Suspense>

            <div className="qt-catalogue-results">
              <Suspense
                key={queryKey}
                fallback={<ProductGridSkeleton count={6} />}
              >
                <CatalogueResults
                  productsPromise={productsPromise}
                  queryKey={queryKey}
                  baseQuery={{ category: category.slug }}
                  emptyTitle={`No ${category.name} Found`}
                  emptyDescription="No products currently match your selected filters."
                  resetUrl={`/categories/${category.slug}`}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </CatalogueControls>
  );
}
