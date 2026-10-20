"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { PRODUCT_TYPES } from "@/lib/productCatalog";
import { ICategory } from "@/types";
import { Modal } from "@/components/common/Modal";
import { useCatalogueControls } from "./CatalogueControls";
import {
  CATALOGUE_FILTER_KEYS as keys,
  type CatalogueFilterKey as FilterKey,
  type CatalogueFilterValues as Values,
  getRouteCategory,
  getCatalogueFilterValues,
  buildCatalogueFilterHref,
} from "@/lib/catalogueNavigation";
export interface ProductFiltersProps {
  categories: ICategory[];
  brands: string[];
  movements: string[];
}
function FilterForm({
  categories,
  brands,
  movements,
  mobile = false,
  onClose,
}: ProductFiltersProps & { mobile?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeCategory = getRouteCategory(pathname);
  const defaults = getCatalogueFilterValues(pathname, searchParams.toString());
  defaults.category =
    categories.find((category) =>
      [category.slug, category.name].some(
        (value) => value.toLowerCase() === defaults.category.toLowerCase(),
      ),
    )?.slug || defaults.category;
  const [values, setValues] = useState(defaults);
  const [error, setError] = useState("");
  const navigate = (next: Values) => {
    router.push(
      buildCatalogueFilterHref(pathname, searchParams.toString(), next),
    );
  };
  const update = (key: FilterKey, value: string, immediate = true) => {
    const next = { ...values, [key]: value };
    if (key === "productType") {
      next.movement = "";
      next.size = "";
      next.color = "";
    }
    setValues(next);
    if (!mobile && immediate) navigate(next);
  };
  const apply = () => {
    if (
      (values.minPrice && Number(values.minPrice) < 0) ||
      (values.maxPrice && Number(values.maxPrice) < 0) ||
      (values.minPrice &&
        values.maxPrice &&
        Number(values.minPrice) > Number(values.maxPrice))
    ) {
      setError(
        "Enter a valid price range. The minimum must be less than the maximum.",
      );
      return;
    }
    setError("");
    navigate({
      ...values,
      size: values.size.trim(),
      color: values.color.trim(),
    });
    onClose?.();
  };
  const clear = () => {
    const next = {
      ...Object.fromEntries(keys.map((key) => [key, ""])),
      productType: pathname === "/watches" ? "watch" : "",
      category: routeCategory,
    } as Values;
    setValues(next);
    setError("");
    if (!mobile) navigate(next);
  };
  const options = (
    key: FilterKey,
    items: { value: string; label: string }[],
  ) => (
    <div className="qt-filter-options">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={values[key] === item.value}
          onClick={() => update(key, item.value)}
        >
          <span>{item.label}</span>
          {values[key] === item.value && <Check size={15} />}
        </button>
      ))}
    </div>
  );
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      <div className="qt-filter-reset">
        <span>{mobile ? "Refine your selection" : "Refine by"}</span>
        <button type="button" onClick={clear}>
          Clear all
        </button>
      </div>
      {mobile && (
        <fieldset className="qt-filter-section">
          <legend>Sort by</legend>
          {options("sort", [
            { value: "", label: "Featured" },
            { value: "newest", label: "Newest" },
            { value: "price-low", label: "Price: Low–High" },
            { value: "price-high", label: "Price: High–Low" },
          ])}
        </fieldset>
      )}
      <fieldset className="qt-filter-section">
        <legend>Department</legend>
        {options("productType", [
          { value: "", label: "All products" },
          ...PRODUCT_TYPES,
        ])}
      </fieldset>
      <fieldset className="qt-filter-section">
        <legend>Collections</legend>
        {options("category", [
          { value: "", label: "All collections" },
          ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
        ])}
      </fieldset>
      <fieldset className="qt-filter-section">
        <legend>Brand</legend>
        <div>
          <label
            className="sr-only"
            htmlFor={`${mobile ? "mobile" : "desktop"}-brand`}
          >
            Filter by brand
          </label>
          <select
            id={`${mobile ? "mobile" : "desktop"}-brand`}
            value={values.brand}
            onChange={(event) => update("brand", event.target.value)}
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </fieldset>
      {(!values.productType || values.productType === "watch") && (
        <fieldset className="qt-filter-section">
          <legend>Movement</legend>
          <div>
            <label
              className="sr-only"
              htmlFor={`${mobile ? "mobile" : "desktop"}-movement`}
            >
              Filter by movement
            </label>
            <select
              id={`${mobile ? "mobile" : "desktop"}-movement`}
              value={values.movement}
              onChange={(event) => update("movement", event.target.value)}
            >
              <option value="">All movements</option>
              {movements.map((movement) => (
                <option key={movement}>{movement}</option>
              ))}
            </select>
          </div>
        </fieldset>
      )}
      {values.productType !== "watch" && (
        <fieldset className="qt-filter-section">
          <legend>Size & colour</legend>
          <div className="space-y-4">
            <label>
              Size
              <input
                value={values.size}
                onChange={(event) => update("size", event.target.value, false)}
                placeholder={
                  values.productType === "shoes"
                    ? "e.g. UK 8"
                    : "e.g. M or UK 8"
                }
              />
            </label>
            <label>
              Colour
              <input
                value={values.color}
                onChange={(event) => update("color", event.target.value, false)}
                placeholder="e.g. Black"
              />
            </label>
            {!mobile && (
              <button type="submit" className="qt-text-link">
                Apply size & colour
              </button>
            )}
          </div>
        </fieldset>
      )}
      <fieldset className="qt-filter-section">
        <legend>Availability</legend>
        {options("availability", [
          { value: "", label: "All products" },
          { value: "in_stock", label: "In stock" },
          { value: "made_to_order", label: "Made to order" },
          { value: "reserved", label: "Reserved" },
          { value: "sold_out", label: "Sold out" },
        ])}
      </fieldset>
      <fieldset className="qt-filter-section">
        <legend>Shop by price (₹)</legend>
        <div className="grid grid-cols-2 gap-2">
          <label>
            Minimum
            <input
              type="number"
              min="0"
              value={values.minPrice}
              placeholder="₹ Min"
              onChange={(event) =>
                update("minPrice", event.target.value, false)
              }
            />
          </label>
          <label>
            Maximum
            <input
              type="number"
              min="0"
              value={values.maxPrice}
              placeholder="₹ Max"
              onChange={(event) =>
                update("maxPrice", event.target.value, false)
              }
            />
          </label>
        </div>
        {!mobile && (
          <button type="submit" className="qt-text-link mt-4">
            Apply price range
          </button>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-rose-600 mt-4">
          {error}
        </p>
      )}
      {mobile && (
        <div className="qt-filter-footer">
          <button
            type="button"
            className="qt-button qt-button-secondary"
            onClick={clear}
          >
            Clear
          </button>
          <button type="submit" className="qt-button">
            Show results
          </button>
        </div>
      )}
    </form>
  );
}
export const ProductFilters = (props: ProductFiltersProps) => {
  const { desktopVisible, mobileOpen, closeMobile } = useCatalogueControls();
  const params = useSearchParams();
  const pathname = usePathname();
  const key = `${pathname}?${params}`;
  return (
    <>
      {desktopVisible && (
        <aside
          id="catalogue-filters"
          aria-label="Product filters"
          className="qt-filters"
        >
          <FilterForm key={key} {...props} />
        </aside>
      )}
      {mobileOpen && (
        <Modal
          title="Filter & sort"
          onClose={closeMobile}
          className="qt-filter-dialog"
        >
          <FilterForm key={key} {...props} mobile onClose={closeMobile} />
        </Modal>
      )}
    </>
  );
};
