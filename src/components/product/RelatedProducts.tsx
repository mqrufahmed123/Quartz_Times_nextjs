import React from 'react';
import { IProduct } from '@/types';
import { ProductCard } from '@/components/catalogue/ProductCard';

export interface RelatedProductsProps {
  products: IProduct[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="space-y-6 pt-12 border-t border-luxury-800">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[11px] uppercase tracking-ultra text-gold font-medium block">
            Complementary References
          </span>
          <h2 className="font-serif text-2xl text-luxury-100 font-normal">
            You May Also Admire
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </section>
  );
};
