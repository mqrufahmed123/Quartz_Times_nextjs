import { unstable_cache } from 'next/cache';
import { getCategories } from '@/services/categoryService';
import { getDistinctBrands, getDistinctMovements } from '@/services/productService';
import { IPaginatedResult, IProduct } from '@/types';
import { ProductFilters } from './ProductFilters';
import { CatalogueHeader } from './CatalogueHeader';
import { ProductGrid } from './ProductGrid';

const getFilterOptions = unstable_cache(
  async () => {
    const [categories, brands, movements] = await Promise.all([
      getCategories(false),
      getDistinctBrands(),
      getDistinctMovements(),
    ]);
    return { categories, brands, movements };
  },
  ['catalogue-filter-options'],
  { revalidate: 300, tags: ['catalogue-filters'] }
);

export async function CatalogueFiltersData() {
  const { categories, brands, movements } = await getFilterOptions();
  return <ProductFilters categories={categories} brands={brands} movements={movements} />;
}

export async function CatalogueSummary({ productsPromise, categoryName }: {
  productsPromise: Promise<IPaginatedResult<IProduct>>;
  categoryName?: string;
}) {
  const products = await productsPromise;
  return <CatalogueHeader total={products.total} categoryName={categoryName} />;
}

export async function CatalogueResults({
  productsPromise,
  queryKey,
  baseQuery,
  emptyTitle = 'No Watches Found',
  emptyDescription = 'No watches match your selected filters. Try changing or resetting the filters.',
  resetUrl = '/watches',
}: {
  productsPromise: Promise<IPaginatedResult<IProduct>>;
  queryKey: string;
  baseQuery?: Record<string, string>;
  emptyTitle?: string;
  emptyDescription?: string;
  resetUrl?: string;
}) {
  const products = await productsPromise;
  return (
    <ProductGrid
      products={products.items}
      initialPage={products.page}
      initialHasMore={products.hasMore}
      pageSize={12}
      baseQuery={baseQuery}
      queryKey={queryKey}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      resetUrl={resetUrl}
    />
  );
}
