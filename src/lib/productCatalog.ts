import type { IProductSpecifications, ProductType } from '@/types';

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'watch', label: 'Watches' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'tshirt', label: 'T-shirts' },
];

const common = [
  ['referenceNumber', 'Model / Reference Number'],
  ['condition', 'Condition'],
  ['warranty', 'Warranty'],
] as const;

export const SPECIFICATION_FIELDS: Record<ProductType, readonly (readonly [keyof IProductSpecifications, string])[]> = {
  watch: [
    ['movement', 'Movement'], ['caseMaterial', 'Case Material'], ['caseDiameter', 'Case Diameter'],
    ['dialColor', 'Dial Color'], ['crystal', 'Glass'], ['strapMaterial', 'Strap / Bracelet'],
    ['waterResistance', 'Water Resistance'], ['powerReserve', 'Power Reserve'], ...common,
  ],
  shoes: [
    ['upperMaterial', 'Upper Material'], ['soleMaterial', 'Sole Material'], ['closure', 'Closure'],
    ['fit', 'Fit'], ['careInstructions', 'Care Instructions'], ...common,
  ],
  tshirt: [
    ['material', 'Fabric / Material'], ['fit', 'Fit'], ['neckline', 'Neckline'],
    ['sleeveLength', 'Sleeve Length'], ['pattern', 'Pattern'], ['careInstructions', 'Care Instructions'], ...common,
  ],
};

export function getProductType(type?: ProductType): ProductType {
  return type || 'watch';
}
