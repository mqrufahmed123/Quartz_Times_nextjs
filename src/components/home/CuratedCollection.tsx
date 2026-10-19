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
  title = 'Featured Watches',
  subtitle = 'Handpicked luxury and automatic timepieces ready for fast delivery',
}) => {
  return (
    <section className="py-14 sm:py-20 bg-slate-50 dark:bg-[#0A0A0B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Handpicked Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 font-bold">
              {title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl font-normal">
              {subtitle}
            </p>
          </div>

          <Link
            href="/watches"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold transition-colors group self-start md:self-auto"
          >
            <span>View All Watches</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
          {products.slice(0, 6).map((product, index) => (
            <ProductCard key={product.id || product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
};
