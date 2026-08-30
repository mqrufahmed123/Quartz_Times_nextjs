'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, X, RotateCcw, Check } from 'lucide-react';
import { ICategory } from '@/types';

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
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
    setIsOpenMobile(false);
  };

  const applyPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentBrand !== 'all' ||
    currentMovement !== 'all' ||
    currentAvailability !== 'all' ||
    !!currentMinPrice ||
    !!currentMaxPrice;

  const filterContent = (
    <div className="space-y-6">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-500" />
          Filter Watches
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
          Category
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParam('category', 'all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              currentCategory === 'all'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Watches</span>
            {currentCategory === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => updateParam('category', cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
          Brand
        </label>
        <select
          value={currentBrand}
          onChange={(e) => updateParam('brand', e.target.value)}
          aria-label="Filter by Brand"
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors font-medium"
        >
          <option value="all">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Movement Filter */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
          Movement
        </label>
        <select
          value={currentMovement}
          onChange={(e) => updateParam('movement', e.target.value)}
          aria-label="Filter by Movement"
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors font-medium"
        >
          <option value="all">All Movements</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual Winding</option>
          <option value="Quartz">Quartz</option>
          <option value="Spring Drive">Spring Drive</option>
          <option value="Chronometer">Chronometer</option>
        </select>
      </div>

      {/* Availability Filter */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
          Availability
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'reserved', label: 'Reserved' },
            { id: 'sold_out', label: 'Out of Stock' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateParam('availability', item.id)}
              className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                currentAvailability === item.id
                  ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
          Price Range (INR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 font-medium"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
        <button
          type="button"
          onClick={applyPriceRange}
          disabled={minPrice === currentMinPrice && maxPrice === currentMaxPrice}
          className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-amber-500 disabled:cursor-default disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          Apply Price Range
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider py-3 rounded-lg shadow-sm transition-colors"
        >
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Filter Watches {hasActiveFilters && '(Active)'}</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
                <span className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                  Filters
                </span>
                <button
                  onClick={() => setIsOpenMobile(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
              <button
                onClick={() => setIsOpenMobile(false)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors"
              >
                Apply & View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Filter */}
      <div className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-fit sticky top-24 shadow-sm transition-colors">
        {filterContent}
      </div>
    </>
  );
};
