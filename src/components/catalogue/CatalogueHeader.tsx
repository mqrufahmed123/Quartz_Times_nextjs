"use client";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { PRODUCT_TYPES } from "@/lib/productCatalog";
import { useStorefrontCategories } from "@/components/common/StorefrontCategoriesProvider";
import { useCatalogueControls } from "./CatalogueControls";
export interface CatalogueHeaderProps {
  total: number;
  categoryName?: string;
}
export const CatalogueHeader = ({
  total,
  categoryName,
}: CatalogueHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const categories = useStorefrontCategories();
  const { toggleFilters, desktopVisible } = useCatalogueControls();
  const type =
    pathname === "/watches" ? "watch" : params.get("productType") || "";
  const currentType = PRODUCT_TYPES.find((item) => item.value === type)?.label;
  const title = params.get("search")
    ? `Results for “${params.get("search")}”`
    : categoryName || currentType || "All products";
  const labels: Record<string, string> = {
    productType: "Department",
    size: "Size",
    color: "Colour",
    brand: "Brand",
    movement: "Movement",
    availability: "Availability",
    minPrice: "Min ₹",
    maxPrice: "Max ₹",
    search: "Search",
    category: "Collection",
  };
  const displayValue = (key: string, value: string) =>
    key === "productType"
      ? PRODUCT_TYPES.find((item) => item.value === value)?.label || value
      : key === "category"
        ? categories.find((cat) => cat.slug === value || cat.name === value)
            ?.name || value
        : value.replaceAll("_", " ");
  const chips = Array.from(params.entries()).filter(
    ([key, value]) => labels[key] && value && value !== "all",
  );
  const change = (key: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}${next.size ? `?${next}` : ""}`);
  };
  return (
    <>
      <div className="qt-catalogue-heading">
        <h1 className="qt-catalogue-title">
          {title} <span className="qt-muted text-base">({total})</span>
        </h1>
        <nav className="qt-departments" aria-label="Shop by department">
          <Link
            href="/products"
            aria-current={
              !type && pathname === "/products" && !params.size
                ? "page"
                : undefined
            }
          >
            All products
          </Link>
          {PRODUCT_TYPES.map((item) => (
            <Link
              key={item.value}
              href={`/products?productType=${item.value}`}
              aria-current={type === item.value ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/products?sort=newest"
            aria-current={
              !type && params.get("sort") === "newest" ? "page" : undefined
            }
          >
            New arrivals
          </Link>
        </nav>
      </div>
      <div className="qt-catalogue-toolbar">
        <p aria-live="polite">
          {total} {total === 1 ? "product" : "products"}
        </p>
        <div className="qt-catalogue-tools">
          <button onClick={toggleFilters} aria-controls="catalogue-filters">
            <span className="qt-desktop-filter-label">
              {desktopVisible ? "Hide filters" : "Show filters"}
            </span>
            <span className="lg:hidden">Filter</span>
            <SlidersHorizontal size={18} />
          </button>
          <label className="sr-only" htmlFor="catalogue-sort">
            Sort products
          </label>
          <select
            id="catalogue-sort"
            aria-label="Sort products"
            value={params.get("sort") || "featured"}
            onChange={(event) => change("sort", event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low–High</option>
            <option value="price-high">Price: High–Low</option>
          </select>
        </div>
      </div>
      {!!chips.length && (
        <div className="qt-filter-chips">
          {chips.map(([key, value]) => (
            <span className="qt-filter-chip" key={key}>
              {labels[key]}: {displayValue(key, value)}
              <button
                onClick={() => change(key)}
                aria-label={`Remove ${labels[key].toLowerCase()} filter`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
};
