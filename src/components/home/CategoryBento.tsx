import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ICategory } from "@/types";
export interface CategoryBentoProps {
  categories: ICategory[];
}
export const CategoryBento = ({ categories }: CategoryBentoProps) => {
  if (!categories.length) return null;
  return (
    <section className="qt-section">
      <div className="qt-container">
        <div className="qt-section-heading">
          <div>
            <h2>Find your kind of style.</h2>
            <p>Explore the collections.</p>
          </div>
        </div>
        <div className="qt-category-grid">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${encodeURIComponent(category.slug)}`}
            >
              <div className="qt-category-photo">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 639px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <span className="text-3xl tracking-tighter font-medium qt-muted">
                      {category.name}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="qt-category-name">
                {category.name}
                <ArrowUpRight size={19} />
              </h3>
              {category.description && (
                <p className="text-sm qt-muted mt-2 leading-6">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
