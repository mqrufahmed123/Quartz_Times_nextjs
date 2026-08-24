import React from 'react';
import { IProduct } from '@/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/common/EmptyState';

export interface ProductGridProps {
  products: IProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  resetUrl?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyTitle,
  emptyDescription,
  onResetFilters,
  resetUrl,
}) => {
  if (!products || products.length === 0) {
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
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
      {products.map((product, idx) => (
        <ProductCard key={product.id || product.slug} product={product} priority={idx < 4} />
      ))}
    </div>
  );
};
