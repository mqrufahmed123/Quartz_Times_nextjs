import React from "react";
const block =
  "animate-pulse bg-slate-100 dark:bg-white/5 motion-reduce:animate-none";
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className={`${block} aspect-square`} />
      <div className="space-y-3 py-4">
        <div className={`${block} h-3 w-20`} />
        <div className={`${block} h-4 w-4/5`} />
        <div className={`${block} h-3 w-2/3`} />
        <div className={`${block} h-5 w-24`} />
        <div className={`${block} h-6 w-28`} />
      </div>
    </div>
  );
}
export function CatalogueHeaderSkeleton() {
  return (
    <div className="space-y-6 mb-6" aria-hidden="true">
      <div className={`${block} h-9 w-56`} />
      <div className={`${block} h-10 w-80 max-w-full`} />
      <div className={`${block} h-12 w-full`} />
    </div>
  );
}
export function FilterSkeleton() {
  return (
    <div
      className="hidden lg:block w-[220px] shrink-0 space-y-6"
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className={`${block} h-24 w-full`} />
      ))}
    </div>
  );
}
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="qt-product-grid w-full"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
export function CatalogueSkeleton() {
  return (
    <div className="qt-catalogue qt-container">
      <CatalogueHeaderSkeleton />
      <div className="qt-catalogue-layout">
        <FilterSkeleton />
        <div className="qt-catalogue-results">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
export function ProductDetailSkeleton() {
  return (
    <div
      className="qt-container qt-detail space-y-8"
      role="status"
      aria-label="Loading product"
    >
      <div className={`${block} h-4 w-56`} />
      <div className="qt-detail-grid">
        <div className={`${block} aspect-square`} />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className={`${block} h-12 w-full`} />
          ))}
        </div>
      </div>
    </div>
  );
}
