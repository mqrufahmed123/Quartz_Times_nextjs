import React from 'react';
import { IProduct } from '@/types';
import { ProductCard } from '@/components/catalogue/ProductCard';

export interface RelatedProductsProps {
  products: IProduct[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="space-y-6 pt-12 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
            More Options
          </span>
          <h2 className="font-serif text-2xl text-slate-900 dark:text-slate-100 font-bold">
            You May Also Like
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </section>
  );
};
