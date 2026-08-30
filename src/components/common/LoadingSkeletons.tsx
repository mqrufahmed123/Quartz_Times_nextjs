import React from 'react';

const block = 'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 motion-reduce:animate-none';

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <div className={`${block} aspect-square rounded-none`} />
      <div className="space-y-4 p-5">
        <div className={`${block} h-3 w-24`} />
        <div className={`${block} h-5 w-4/5`} />
        <div className={`${block} h-3 w-2/3`} />
        <div className="flex items-end justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className={`${block} h-6 w-28`} />
          <div className={`${block} h-9 w-24`} />
        </div>
      </div>
    </div>
  );
}

export function CatalogueHeaderSkeleton() {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div className="space-y-3">
        <div className={`${block} h-9 w-56`} />
        <div className={`${block} h-3 w-28`} />
      </div>
      <div className={`${block} h-10 w-36`} />
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="hidden w-64 shrink-0 space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70 lg:block">
      <div className={`${block} h-5 w-32`} />
      {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className={`${block} h-10 w-full`} />)}
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid flex-1 grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3" aria-label="Loading watches">
      {Array.from({ length: count }, (_, index) => <ProductCardSkeleton key={index} />)}
    </div>
  );
}

export function CatalogueSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-[#0A0A0B] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-3">
          <div className={`${block} h-9 w-56`} />
          <div className={`${block} h-4 w-80 max-w-full`} />
        </div>
        <div className="flex gap-8">
          <div className="hidden w-64 shrink-0 space-y-4 lg:block">
            {[1, 2, 3, 4, 5].map((item) => <div key={item} className={`${block} h-11 w-full`} />)}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <ProductCardSkeleton key={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-[#0A0A0B] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className={`${block} h-4 w-72 max-w-full`} />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className={`${block} aspect-square lg:col-span-7`} />
          <div className="space-y-5 lg:col-span-5">
            <div className={`${block} h-4 w-24`} />
            <div className={`${block} h-10 w-4/5`} />
            <div className={`${block} h-6 w-36`} />
            <div className={`${block} h-14 w-full`} />
            <div className={`${block} h-14 w-full`} />
            <div className={`${block} h-32 w-full`} />
          </div>
        </div>
      </div>
    </div>
  );
}
