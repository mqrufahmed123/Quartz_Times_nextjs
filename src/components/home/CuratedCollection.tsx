import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IProduct } from "@/types";
import { ProductCard } from "@/components/catalogue/ProductCard";
export interface CuratedCollectionProps {
  products: IProduct[];
  title?: string;
  subtitle?: string;
}
export const CuratedCollection = ({
  products,
  title = "The latest selection",
  subtitle,
}: CuratedCollectionProps) => {
  if (!products.length) return null;
  return (
    <section className="qt-section">
      <div className="qt-container">
        <div className="qt-section-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Link
            href={
              title === "New arrivals" ? "/products?sort=newest" : "/products"
            }
            className="qt-text-link"
          >
            Shop all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="qt-featured-grid">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
