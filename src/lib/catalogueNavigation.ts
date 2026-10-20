/** URL construction shared by the desktop controls and mobile filter draft. */
export const CATALOGUE_FILTER_KEYS = [
  "productType",
  "category",
  "brand",
  "movement",
  "availability",
  "size",
  "color",
  "minPrice",
  "maxPrice",
  "sort",
] as const;
export type CatalogueFilterKey = (typeof CATALOGUE_FILTER_KEYS)[number];
export type CatalogueFilterValues = Record<CatalogueFilterKey, string>;
export function getRouteCategory(pathname: string) {
  return pathname.startsWith("/categories/")
    ? decodeURIComponent(pathname.slice("/categories/".length))
    : "";
}
export function getCatalogueFilterValues(
  pathname: string,
  query: string,
): CatalogueFilterValues {
  const params = new URLSearchParams(query);
  return Object.fromEntries(
    CATALOGUE_FILTER_KEYS.map((key) => {
      const value =
        key === "category" && getRouteCategory(pathname)
          ? getRouteCategory(pathname)
          : key === "productType" && pathname === "/watches"
            ? "watch"
            : params.get(key) || "";
      return [key, value === "all" ? "" : value];
    }),
  ) as CatalogueFilterValues;
}
export function buildCatalogueFilterHref(
  pathname: string,
  query: string,
  values: CatalogueFilterValues,
) {
  const params = new URLSearchParams(query);
  CATALOGUE_FILTER_KEYS.forEach((key) => {
    const value = values[key].trim();
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
  });
  params.delete("page");
  const routeCategory = getRouteCategory(pathname);
  const destination =
    (routeCategory && values.category !== routeCategory) ||
    (pathname === "/watches" && values.productType !== "watch")
      ? "/products"
      : pathname;
  if (destination === pathname && routeCategory) params.delete("category");
  return `${destination}${params.size ? `?${params}` : ""}`;
}
