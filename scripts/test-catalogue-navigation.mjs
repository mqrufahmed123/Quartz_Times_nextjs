import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = fs.readFileSync(
  new URL("../src/lib/catalogueNavigation.ts", import.meta.url),
  "utf8",
);
const testModule = { exports: {} };
vm.runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { module: testModule, exports: testModule.exports, URLSearchParams },
);
const { getCatalogueFilterValues: read, buildCatalogueFilterHref: href } =
  testModule.exports;
const query = (url) => new URL(url, "https://quartz.example");
let values = read(
  "/products",
  "productType=shoes&size=UK+8&color=Black&sort=price-low&search=leather&page=3",
);
const draft = { ...values, size: " UK 9 ", color: "Brown" };
assert.equal(
  values.size,
  "UK 8",
  "Draft edits must leave the current query untouched",
);
let result = query(href("/products", "search=leather&page=3&limit=12", draft));
assert.equal(result.searchParams.get("size"), "UK 9");
assert.equal(result.searchParams.get("color"), "Brown");
assert.equal(result.searchParams.get("sort"), "price-low");
assert.equal(result.searchParams.get("search"), "leather");
assert.equal(result.searchParams.get("limit"), "12");
assert.equal(result.searchParams.has("page"), false);
values = read("/categories/diver", "brand=Seiko");
assert.equal(values.category, "diver");
assert.equal(
  query(href("/categories/diver", "brand=Seiko", values)).pathname,
  "/categories/diver",
);
assert.equal(
  query(href("/categories/diver", "", values)).searchParams.has("category"),
  false,
);
result = query(
  href("/categories/diver", "", { ...values, category: "automatic" }),
);
assert.equal(result.pathname, "/products");
assert.equal(result.searchParams.get("category"), "automatic");
assert.equal(
  query(href("/categories/diver", "", { ...values, category: "" })).pathname,
  "/products",
);
values = read("/watches", "productType=shoes&movement=Quartz");
assert.equal(
  values.productType,
  "watch",
  "Legacy watch listing stays watch-only",
);
assert.equal(query(href("/watches", "", values)).pathname, "/watches");
assert.equal(
  query(href("/watches", "", { ...values, productType: "shoes", movement: "" }))
    .pathname,
  "/products",
);
values = read("/products", "productType=all&category=all&availability=all");
assert.equal(values.productType, "");
assert.equal(href("/products", "page=9", values), "/products");
values = read(
  "/products",
  "category=A%26B&minPrice=0&maxPrice=2000&availability=made_to_order",
);
result = query(href("/products", "", values));
assert.equal(result.searchParams.get("category"), "A&B");
assert.equal(result.searchParams.get("minPrice"), "0");
assert.equal(result.searchParams.get("availability"), "made_to_order");
console.log(
  "Catalogue navigation passed: draft isolation, sorting/search preservation, pagination reset, price bounds, category transitions, and legacy watch routes.",
);
