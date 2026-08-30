import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ICategory } from '@/types';

export interface CategoryBentoProps {
  categories: ICategory[];
}

export const CategoryBento: React.FC<CategoryBentoProps> = ({ categories }) => {
  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
            Browse Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 font-bold">
            Shop by Style & Movement
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
            Explore automatic watches, chronographs, vintage classics, and diver styles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/watches?category=${cat.slug}`}
              className={`group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all duration-300 shadow-md ${
                idx === 0 || idx === 3 ? 'md:col-span-2 aspect-[16/9] sm:aspect-[21/9]' : 'aspect-[4/3] sm:aspect-[1/1]'
              }`}
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              )}

              {/* Dark Gradient Overlay for legible text */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent transition-opacity group-hover:opacity-90" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <div className="space-y-1 max-w-md">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                      Category
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-amber-400 transition-colors font-bold">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 font-normal">
                      {cat.description}
                    </p>
                  </div>

                  <span className="w-9 h-9 rounded-full bg-slate-800/90 text-amber-400 border border-amber-400/40 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
