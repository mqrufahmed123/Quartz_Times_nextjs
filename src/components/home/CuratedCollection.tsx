import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { IProduct } from '@/types';
import { ProductCard } from '@/components/catalogue/ProductCard';

export interface CuratedCollectionProps {
  products: IProduct[];
  title?: string;
  subtitle?: string;
}

export const CuratedCollection: React.FC<CuratedCollectionProps> = ({
  products,
  title = 'Curated Highlights',
  subtitle = 'Acquisitions handpicked for aesthetic provenance and mechanical integrity',
}) => {
  return (
    <section className="py-16 sm:py-24 bg-luxury-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-luxury-900 pb-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-ultra text-gold font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              The Private Vault
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-luxury-100 font-normal">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-luxury-400 max-w-xl font-light">
              {subtitle}
            </p>
          </div>

          <Link
            href="/watches"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-hover font-semibold transition-colors group self-start md:self-auto"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.slice(0, 6).map((product, index) => (
            <ProductCard key={product.id || product.slug} product={product} priority={index < 3} />
          ))}
        </div>
      </div>
    </section>
  );
};
