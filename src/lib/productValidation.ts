import type { IProduct } from '@/types';
import { PRODUCT_TYPES, SPECIFICATION_FIELDS, getProductType } from './productCatalog';

/** Validate new catalogue fields on both creates and partial updates, including demo mode. */
export function validateProductOptions(data: Record<string, unknown>, previous?: IProduct, partial = false): string | null {
  if ('productType' in data && !PRODUCT_TYPES.some(type => type.value === data.productType)) {
    return 'Choose a valid product type: watch, shoes, or tshirt.';
  }
  const type = getProductType((data.productType || previous?.productType) as IProduct['productType']);
  if ('specifications' in data) {
    const specs = data.specifications;
    if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return 'Invalid product specifications.';
    const fields = (data.productType || previous || !partial ? SPECIFICATION_FIELDS[type] : Object.values(SPECIFICATION_FIELDS).flat()).map(([key]) => key);
    if (Object.entries(specs).some(([key, value]) => !fields.includes(key as typeof fields[number]) || typeof value !== 'string' || value.length > 2000)) {
      return 'Use the specification fields for the selected product type.';
    }
  }
  if (previous?.variants?.length && 'stock' in data && !('variants' in data)) {
    return 'Update size and colour variant quantities to change stock.';
  }
  if ('variants' in data) {
    if (!Array.isArray(data.variants) || data.variants.length > 100) return 'Provide at most 100 size and colour variants.';
    const skus = new Set<string>();
    const combinations = new Set<string>();
    let stock = 0;
    for (const variant of data.variants) {
      if (!variant || typeof variant !== 'object' || Array.isArray(variant) ||
          Object.keys(variant).some(key => !['sku', 'size', 'color', 'stock'].includes(key))) return 'Invalid variant details.';
      if (['sku', 'size', 'color'].some(key => typeof variant[key] !== 'string' || !variant[key].trim() || variant[key].length > 100)) {
        return 'Each variant needs a SKU, size (including sizing system for shoes), and colour.';
      }
      if (!Number.isSafeInteger(variant.stock) || variant.stock < 0) return 'Variant stock must be a nonnegative whole number.';
      const sku = variant.sku.trim().toUpperCase();
      const combination = JSON.stringify([variant.size.trim().toLowerCase(), variant.color.trim().toLowerCase()]);
      if (skus.has(sku) || combinations.has(combination)) return 'Variant SKUs and size/colour combinations must be unique within a product.';
      skus.add(sku);
      combinations.add(combination);
      stock += variant.stock;
    }
    if (!Number.isSafeInteger(stock)) return 'Total variant stock is too large.';
  }
  return null;
}

export function normalizeProductVariants(data: Record<string, any>, previous?: IProduct): void {
  if (!('variants' in data)) {
    // Unrelated partial edits must not rewrite a stale snapshot of variant inventory.
    if (data.availability === 'in_stock' && previous?.variants?.length && previous.variants.every(variant => variant.stock === 0)) data.availability = 'sold_out';
    return;
  }
  const variants = data.variants;
  if (!variants?.length) return;
  data.variants = variants.map(({ sku, size, color, stock }: { sku: string; size: string; color: string; stock: number }) => ({
    sku: sku.trim().toUpperCase(), size: size.trim(), color: color.trim(), stock,
  }));
  data.stock = variants.reduce((total: number, variant: { stock: number }) => total + variant.stock, 0);
  if (data.stock === 0 && (data.availability || previous?.availability || 'in_stock') === 'in_stock') data.availability = 'sold_out';
}
