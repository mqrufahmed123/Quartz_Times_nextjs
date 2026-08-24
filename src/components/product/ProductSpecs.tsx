import React from 'react';
import { IProductSpecifications } from '@/types';

export interface ProductSpecsProps {
  specifications: IProductSpecifications;
  brand: string;
  category: string;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({
  specifications,
  brand,
  category,
}) => {
  const specsList = [
    { label: 'Manufacture', value: brand },
    { label: 'Classification', value: category },
    { label: 'Calibre / Movement', value: specifications.movement },
    { label: 'Case Material', value: specifications.caseMaterial },
    { label: 'Case Diameter', value: specifications.caseDiameter },
    { label: 'Dial & Luminescence', value: specifications.dialColor },
    { label: 'Crystal / Glass', value: specifications.crystal },
    { label: 'Strap / Bracelet', value: specifications.strapMaterial },
    { label: 'Water Resistance', value: specifications.waterResistance },
    { label: 'Power Reserve', value: specifications.powerReserve },
    { label: 'Reference Number', value: specifications.referenceNumber },
    { label: 'Condition Grade', value: specifications.condition },
    { label: 'Warranty & Coverage', value: specifications.warranty },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="rounded-xl border border-luxury-800 bg-luxury-900/30 p-6 sm:p-8">
      <div className="border-b border-luxury-800 pb-4 mb-6">
        <h3 className="font-serif text-lg sm:text-xl font-medium text-luxury-100">
          Technical Specifications
        </h3>
        <p className="text-xs uppercase tracking-widest text-luxury-400 mt-1">
          Atelier Certification & Dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
        {specsList.map((spec) => (
          <div
            key={spec.label}
            className="flex items-center justify-between py-2.5 border-b border-luxury-800/60"
          >
            <span className="text-luxury-400 font-medium tracking-wider uppercase text-[11px]">
              {spec.label}
            </span>
            <span className="text-luxury-100 font-medium text-right max-w-[60%]">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
