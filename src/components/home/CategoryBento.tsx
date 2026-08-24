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
    <section className="py-16 sm:py-24 bg-luxury-900/30 border-y border-luxury-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-[11px] uppercase tracking-ultra text-gold font-semibold block">
            Horological Classifications
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-luxury-100 font-normal">
            Discover by Complication & Style
          </h2>
          <p className="text-xs sm:text-sm text-luxury-400 font-light">
            From precision automatic rotors to iconic motorsport chronographs and dress silhouettes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/watches?category=${cat.slug}`}
              className={`group relative rounded-xl overflow-hidden bg-luxury-950 border border-luxury-800/80 hover:border-gold/60 transition-all duration-500 hover:shadow-luxury ${
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

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/95 via-luxury-950/60 to-transparent transition-opacity group-hover:opacity-90" />

              {/* Content Box */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <div className="space-y-1.5 max-w-md">
                    <span className="text-[10px] uppercase tracking-ultra text-gold font-medium">
                      Category
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-luxury-100 group-hover:text-gold transition-colors font-medium">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-luxury-400 line-clamp-2 font-light">
                      {cat.description}
                    </p>
                  </div>

                  <span className="w-10 h-10 rounded-full bg-luxury-900/90 text-gold border border-gold/30 flex items-center justify-center group-hover:bg-gold group-hover:text-luxury-950 transition-all duration-300 shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
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
