'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown, X } from 'lucide-react';

export interface CatalogueHeaderProps {
  total: number;
  categoryName?: string;
}

export const CatalogueHeader: React.FC<CatalogueHeaderProps> = ({
  total,
  categoryName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'featured';
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentMovement = searchParams.get('movement') || '';
  const currentAvailability = searchParams.get('availability') || '';

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 font-bold">
            {categoryName || (currentSearch ? `Search: "${currentSearch}"` : 'Watch Collection')}
          </h1>
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Showing {total} {total === 1 ? 'watch' : 'watches'}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3 h-3 text-amber-500" />
            Sort By:
          </span>
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort watches"
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors font-medium"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Pills */}
      {(currentSearch || currentCategory || currentBrand || currentMovement || currentAvailability) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
            Active Filters:
          </span>

          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-medium">
              Search: {currentSearch}
              <button onClick={() => removeFilter('search')} className="hover:text-slate-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentCategory && currentCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
              Category: {currentCategory}
              <button onClick={() => removeFilter('category')} className="hover:text-slate-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentBrand && currentBrand !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
              Brand: {currentBrand}
              <button onClick={() => removeFilter('brand')} className="hover:text-slate-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentMovement && currentMovement !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
              Movement: {currentMovement}
              <button onClick={() => removeFilter('movement')} className="hover:text-slate-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentAvailability && currentAvailability !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
              Status: {currentAvailability}
              <button onClick={() => removeFilter('availability')} className="hover:text-slate-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
