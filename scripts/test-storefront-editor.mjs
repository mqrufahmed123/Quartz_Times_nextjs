import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function load(relative, dependencies) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const sandboxModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: sandboxModule,
    exports: sandboxModule.exports,
    console,
    require(name) {
      assert(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: relative });
  return sandboxModule.exports;
}

function assertPrivateResponse(response) {
  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /(?:^|,)\s*private\s*(?:,|$)/i);
  assert.match(cacheControl, /(?:^|,)\s*no-store\s*(?:,|$)/i);
}

async function main() {
  let authenticated = false;
  let failProductRead = false;
  let currentProduct = {
    id: 'prod-editor',
    name: 'Original watch',
    slug: 'original-watch',
    brand: 'Quartz Times',
    category: 'Automatic',
    description: 'Original description.',
    sku: 'QT-EDITOR-001',
    price: 2999,
    currency: 'INR',
    status: 'active',
    images: [],
    specifications: {},
  };
  const categories = [{ id: 'cat-1', name: 'Automatic', slug: 'automatic', active: true }];
  const reads = [];
  const mutations = [];
  const invalidatedPaths = [];
  const invalidatedTags = [];
  const dependencies = {
    'next/server': {
      NextResponse: { json: (data, options) => Response.json(data, options) },
    },
    'next/cache': {
      revalidatePath: (...args) => invalidatedPaths.push(args),
      revalidateTag: (...args) => invalidatedTags.push(args),
    },
    '@/lib/auth': {
      getAdminSession: async () => authenticated ? { role: 'admin' } : null,
    },
    '@/services/productService': {
      getProductById: async (id) => {
        reads.push(['product', id]);
        if (failProductRead) throw new Error('Simulated database read failure');
        return currentProduct;
      },
      updateProduct: async (id, data) => {
        mutations.push(['update', id, data]);
        return currentProduct ? { ...currentProduct, ...data } : null;
      },
      deleteProduct: async (id) => {
        mutations.push(['delete', id]);
        return true;
      },
    },
    '@/services/categoryService': {
      getCategories: async (onlyActive) => {
        reads.push(['categories', onlyActive]);
        return categories;
      },
    },
  };
  const context = () => ({ params: Promise.resolve({ id: 'prod-editor' }) });
  const editor = load('src/app/api/admin/products/[id]/editor/route.ts', dependencies);

  const anonymousEditor = await editor.GET({}, context());
  assert.equal(anonymousEditor.status, 401);
  assertPrivateResponse(anonymousEditor);
  assert.deepEqual(reads, [], 'Unauthenticated editor requests must not read products or categories.');

  authenticated = true;
  const protectedEditor = await editor.GET({}, context());
  assert.equal(protectedEditor.status, 200);
  assertPrivateResponse(protectedEditor);
  assert.deepEqual(await protectedEditor.json(), { product: currentProduct, categories });
  assert.deepEqual(reads, [['product', 'prod-editor'], ['categories', false]]);

  reads.length = 0;
  const previousProduct = currentProduct;
  currentProduct = null;
  const missingEditor = await editor.GET({}, context());
  assert.equal(missingEditor.status, 404);
  assertPrivateResponse(missingEditor);
  assert.deepEqual(reads, [['product', 'prod-editor']], 'Missing watches must not load editor categories.');
  currentProduct = previousProduct;
  reads.length = 0;

  failProductRead = true;
  const failedEditor = await editor.GET({}, context());
  assert.equal(failedEditor.status, 500);
  assertPrivateResponse(failedEditor);
  failProductRead = false;
  reads.length = 0;

  const productRoute = load('src/app/api/products/[id]/route.ts', dependencies);
  authenticated = false;
  const forbiddenRequest = {
    json() { throw new Error('Unauthorized requests must be rejected before reading the body.'); },
  };
  assert.equal((await productRoute.PUT(forbiddenRequest, context())).status, 401);
  assert.deepEqual(reads, [], 'Unauthorized updates must not read products.');
  assert.deepEqual(mutations, [], 'Unauthorized updates must not mutate products.');
  assert.deepEqual(invalidatedPaths, []);
  assert.deepEqual(invalidatedTags, []);

  authenticated = true;
  const payload = {
    name: 'Renamed watch',
    slug: 'renamed-watch',
    brand: 'Updated brand',
    category: 'Chronograph',
    description: 'Updated description.',
    price: 3499,
    sku: 'QT-EDITOR-001',
    specifications: { movement: 'Manual-Winding' },
  };
  for (const [field, invalidValue] of [
    ['price', -1], ['price', 0], ['price', '2999'], ['price', Number.NaN], ['price', Number.POSITIVE_INFINITY],
    ['originalPrice', -1], ['originalPrice', '3999'],
    ['stock', -1], ['stock', 1.5], ['stock', '2'], ['stock', Number.MAX_SAFE_INTEGER + 1],
    ['currency', 'inr'], ['currency', 'RUPEES'], ['currency', 123],
    ['slug', ''], ['slug', 'watch/name'], ['slug', 'watch name'], ['slug', '../watch'],
  ]) {
    const invalidRequest = { json: async () => ({ ...payload, [field]: invalidValue }) };
    const invalidResponse = await productRoute.PUT(invalidRequest, context());
    assert.equal(invalidResponse.status, 400, `${field}=${String(invalidValue)} must be rejected.`);
    assert.deepEqual(reads, [], 'Invalid updates must be rejected before reading products.');
    assert.deepEqual(mutations, [], 'Invalid updates must not mutate products.');
    assert.deepEqual(invalidatedPaths, []);
    assert.deepEqual(invalidatedTags, []);
  }
  const saved = await productRoute.PUT({ json: async () => payload }, context());
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).slug, 'renamed-watch');
  assert.equal(mutations.length, 1);
  assert.equal(mutations[0][0], 'update');
  assert.equal(mutations[0][1], 'prod-editor');
  assert.deepEqual(JSON.parse(JSON.stringify(mutations[0][2])), payload);
  for (const route of ['/', '/watches', '/watches/original-watch', '/watches/renamed-watch', '/admin/products']) {
    assert(invalidatedPaths.some(([actual]) => actual === route), `Missing invalidation for ${route}`);
  }
  assert(invalidatedPaths.some(([route, type]) => route === '/categories/[slug]' && type === 'page'),
    'Category listings must refresh after changing a product.');
  assert(invalidatedTags.some(([tag, profile]) => tag === 'catalogue-filters' && profile === 'max'),
    'Brand and movement filters must refresh after product changes.');

  const clearedFields = await productRoute.PUT({
    json: async () => ({
      ...payload,
      originalPrice: null,
      video: null,
      _id: 'forbidden-replacement-id',
      createdAt: '2000-01-01T00:00:00.000Z',
      $set: { price: 1 },
    }),
  }, context());
  assert.equal(clearedFields.status, 200);
  const clearedUpdate = mutations.at(-1)[2];
  assert.equal(clearedUpdate.originalPrice, null, 'Clearing the original price must reach persistence explicitly.');
  assert.equal(clearedUpdate.video, null, 'Removing a video must reach persistence explicitly.');
  for (const field of ['_id', 'createdAt', '$set']) {
    assert(!(field in clearedUpdate), `Protected or unknown field ${field} must be excluded from updates.`);
  }

  console.log('Storefront editor checks passed: protected editor data, private/no-store responses, missing/read-error products, unauthorized updates, invalid prices/stock/currency/slugs, editable-field allowlist, explicit price/video clearing, renamed URLs, catalogue/category/filter invalidation.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
