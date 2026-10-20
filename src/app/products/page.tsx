import { CatalogueControls } from "@/components/catalogue/CatalogueControls";
import React, { Suspense } from "react";
import { Metadata } from "next";
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

export interface ProductsPageProps {
  searchParams: Promise<{
    productType?: string;
    size?: string;
    color?: string;
    category?: string;
    brand?: string;
    movement?: string;
    availability?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: "featured" | "newest" | "price-low" | "price-high";
    search?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const query = await searchParams;
  if (query.category && query.category !== "all") {
    const formatted =
      query.category.charAt(0).toUpperCase() + query.category.slice(1);
    return {
      title: `${formatted} Collection`,
      description: `Explore our ${formatted} collection with direct WhatsApp assistance.`,
    };
  }

  if (query.search) {
    return {
      title: `Search: "${query.search}"`,
      description: `Search results for "${query.search}" in our product collection.`,
    };
  }

  return {
    title: "Watches, Shoes & T-shirts",
    description:
      "Browse watches, shoes, and T-shirts at transparent prices with helpful WhatsApp support.",
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const query = await searchParams;
  const queryKey = JSON.stringify(query);
  const productsPromise = getProducts({
    productType: query.productType,
    size: query.size,
    color: query.color,
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
    <CatalogueControls>
      <div className="qt-catalogue">
        <div className="qt-container">
          <Suspense fallback={<CatalogueHeaderSkeleton />}>
            <CatalogueSummary productsPromise={productsPromise} />
          </Suspense>

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
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </CatalogueControls>
  );
}
