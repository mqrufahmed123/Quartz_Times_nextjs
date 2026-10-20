import React from "react";
import { IProduct } from "@/types";
import { ProductCard } from "@/components/catalogue/ProductCard";

export interface RelatedProductsProps {
  products: IProduct[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="qt-section mt-8 border-t border-[var(--qt-line)]">
      <div className="qt-section-heading">
        <div>
          <h2>You might also like</h2>
          <p>A few more pieces to explore.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5">
        {products.map((product) => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </section>
  );
};
