import { SPECIFICATION_FIELDS } from "@/lib/productCatalog";
import { IProductSpecifications, ProductType } from "@/types";
export interface ProductSpecsProps {
  specifications: IProductSpecifications;
  productType?: ProductType;
  brand: string;
  category: string;
}
export const ProductSpecs = ({
  specifications,
  productType = "watch",
  brand,
  category,
}: ProductSpecsProps) => {
  const specs = [
    { label: "Brand", value: brand },
    { label: "Collection", value: category },
    ...SPECIFICATION_FIELDS[productType].map(([key, label]) => ({
      label,
      value: specifications[key],
    })),
  ].filter((item) => Boolean(item.value));
  return (
    <section className="qt-specs">
      <h2>The details.</h2>
      <p className="qt-muted text-sm">
        Materials, specifications and the finer points.
      </p>
      <dl>
        {specs.map((spec) => (
          <div key={spec.label}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
