"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { IProduct } from "@/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/common/EmptyState";

export interface ProductGridProps {
  products: IProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  resetUrl?: string;
  initialPage?: number;
  initialHasMore?: boolean;
  pageSize?: number;
  baseQuery?: Record<string, string>;
  queryKey?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyTitle,
  emptyDescription,
  onResetFilters,
  resetUrl,
  initialPage = 1,
  initialHasMore = false,
  pageSize = 12,
  baseQuery = {},
  queryKey = "",
}) => {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(products || []);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setItems(products || []);
    setPage(initialPage);
    setHasMore(initialHasMore);
    setLoadError("");
  }, [products, initialPage, initialHasMore, queryKey]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadError("");

    try {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(baseQuery).forEach(([key, value]) =>
        params.set(key, value),
      );
      params.set("page", String(page + 1));
      params.set("limit", String(pageSize));

      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Could not load more products.");

      const result = await response.json();
      setItems((current) => {
        const existing = new Set(
          current.map((product) => product.id || product._id || product.slug),
        );
        const next = (result.items as IProduct[]).filter(
          (product) => !existing.has(product.id || product._id || product.slug),
        );
        return [...current, ...next];
      });
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load more products.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onReset={onResetFilters}
        resetUrl={resetUrl}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="qt-product-grid" aria-live="polite">
        {items.map((product, idx) => (
          <ProductCard
            key={product.id || product.slug}
            product={product}
            priority={idx < 2}
          />
        ))}
      </div>

      {loadError && (
        <p
          className="text-center text-sm text-rose-600 dark:text-rose-400"
          role="alert"
        >
          {loadError}
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="qt-button qt-button-secondary min-w-52"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? "Loading products..." : "Load More Products"}
          </button>
        </div>
      )}
    </div>
  );
};
