'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, X, RotateCcw, Check, ChevronDown } from 'lucide-react';
import { ICategory } from '@/types';
import { formatPrice } from '@/lib/utils';

export interface ProductFiltersProps {
  categories: ICategory[];
  brands: string[];
  movements: string[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  brands,
  movements,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const currentCategory = searchParams.get('category') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentMovement = searchParams.get('movement') || 'all';
  const currentAvailability = searchParams.get('availability') || 'all';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || 'featured';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // reset page to 1 on filter changes
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
    setIsOpenMobile(false);
  };

  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentBrand !== 'all' ||
    currentMovement !== 'all' ||
    currentAvailability !== 'all' ||
    !!currentMinPrice ||
    !!currentMaxPrice;

  const filterContent = (
    <div className="space-y-7">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between pb-3 border-b border-luxury-800">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-widest text-luxury-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gold" />
          Filter Collection
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[11px] uppercase tracking-wider text-gold hover:text-gold-hover transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2.5">
        <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
          Category
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParam('category', 'all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors ${
              currentCategory === 'all'
                ? 'bg-gold/15 text-gold font-medium border border-gold/30'
                : 'text-luxury-300 hover:bg-luxury-900 hover:text-luxury-100'
            }`}
          >
            <span>All Timepieces</span>
            {currentCategory === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => updateParam('category', cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors ${
                  isSelected
                    ? 'bg-gold/15 text-gold font-medium border border-gold/30'
                    : 'text-luxury-300 hover:bg-luxury-900 hover:text-luxury-100'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2.5">
        <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
          Manufacture / Brand
        </label>
        <select
          value={currentBrand}
          onChange={(e) => updateParam('brand', e.target.value)}
          aria-label="Filter by Brand"
          className="w-full bg-luxury-900 border border-luxury-800 text-luxury-200 text-xs rounded px-3 py-2.5 focus:outline-none focus:border-gold transition-colors"
        >
          <option value="all">All Watchmakers</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Movement Filter */}
      <div className="space-y-2.5">
        <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
          Movement Calibre
        </label>
        <select
          value={currentMovement}
          onChange={(e) => updateParam('movement', e.target.value)}
          aria-label="Filter by Movement"
          className="w-full bg-luxury-900 border border-luxury-800 text-luxury-200 text-xs rounded px-3 py-2.5 focus:outline-none focus:border-gold transition-colors"
        >
          <option value="all">All Movements</option>
          <option value="Automatic">Automatic Self-Winding</option>
          <option value="Manual">Manual-Winding</option>
          <option value="Quartz">Quartz Precision</option>
          <option value="Spring Drive">Spring Drive</option>
          <option value="Chronometer">Master Chronometer</option>
        </select>
      </div>

      {/* Availability Filter */}
      <div className="space-y-2.5">
        <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
          Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'reserved', label: 'Reserved' },
            { id: 'sold_out', label: 'Acquired' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateParam('availability', item.id)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-medium border text-center transition-all ${
                currentAvailability === item.id
                  ? 'bg-luxury-800 border-gold text-gold shadow-sm'
                  : 'bg-luxury-950/60 border-luxury-800 text-luxury-400 hover:text-luxury-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2.5">
        <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
          Price Range (INR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={currentMinPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="w-full bg-luxury-900 border border-luxury-800 text-luxury-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-gold"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={currentMaxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="w-full bg-luxury-900 border border-luxury-800 text-luxury-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-gold"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="w-full flex items-center justify-center gap-2 bg-luxury-900 border border-luxury-700 hover:border-gold text-luxury-200 text-xs uppercase tracking-wider py-3 rounded-lg shadow-sm transition-colors"
        >
          <Filter className="w-4 h-4 text-gold" />
          <span>Filter Collection {hasActiveFilters && '(Active)'}</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-luxury-950/80 backdrop-blur-sm"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-luxury-950 border-l border-luxury-800 p-6 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-luxury-800 pb-3 mb-6">
                <span className="font-serif text-base font-bold text-luxury-100">
                  Filters
                </span>
                <button
                  onClick={() => setIsOpenMobile(false)}
                  className="text-luxury-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>

            <div className="pt-6 border-t border-luxury-800 mt-6">
              <button
                onClick={() => setIsOpenMobile(false)}
                className="w-full bg-gold hover:bg-gold-hover text-luxury-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors"
              >
                Apply & View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Filter */}
      <div className="hidden lg:block w-64 shrink-0 bg-luxury-950/70 border border-luxury-800/80 rounded-xl p-6 h-fit sticky top-28">
        {filterContent}
      </div>
    </>
  );
};
