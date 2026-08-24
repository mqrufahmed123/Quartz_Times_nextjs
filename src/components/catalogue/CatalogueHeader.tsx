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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-100 font-normal">
            {categoryName || (currentSearch ? `Search: "${currentSearch}"` : 'Horological Collection')}
          </h1>
          <p className="text-xs uppercase tracking-widest text-luxury-400 mt-1">
            Showing {total} {total === 1 ? 'curated timepiece' : 'curated timepieces'}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] uppercase tracking-widest text-luxury-400 hidden sm:inline flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-gold" />
            Sort By:
          </span>
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort timepieces"
            className="bg-luxury-900 border border-luxury-700 text-luxury-200 text-xs rounded px-3 py-2 focus:outline-none focus:border-gold transition-colors"
          >
            <option value="featured">Featured Curations</option>
            <option value="newest">New Additions</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Pills */}
      {(currentSearch || currentCategory || currentBrand || currentMovement || currentAvailability) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] uppercase tracking-widest text-luxury-500">
            Active Filters:
          </span>

          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 bg-luxury-900 border border-gold/40 text-gold text-xs px-2.5 py-1 rounded-full">
              Search: {currentSearch}
              <button onClick={() => removeFilter('search')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentCategory && currentCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-luxury-900 border border-luxury-700 text-luxury-300 text-xs px-2.5 py-1 rounded-full">
              Category: {currentCategory}
              <button onClick={() => removeFilter('category')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentBrand && currentBrand !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-luxury-900 border border-luxury-700 text-luxury-300 text-xs px-2.5 py-1 rounded-full">
              Brand: {currentBrand}
              <button onClick={() => removeFilter('brand')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentMovement && currentMovement !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-luxury-900 border border-luxury-700 text-luxury-300 text-xs px-2.5 py-1 rounded-full">
              Movement: {currentMovement}
              <button onClick={() => removeFilter('movement')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentAvailability && currentAvailability !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-luxury-900 border border-luxury-700 text-luxury-300 text-xs px-2.5 py-1 rounded-full">
              Status: {currentAvailability}
              <button onClick={() => removeFilter('availability')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
