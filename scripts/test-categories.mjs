import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function load(relative, dependencies, env) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const sandboxModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: sandboxModule,
    exports: sandboxModule.exports,
    process: { env },
    console: { ...console, warn() {}, error() {} },
    require(name) {
      assert(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: relative });
  return sandboxModule.exports;
}

function matches(document, query) {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$or') return condition.some(part => matches(document, part));
    const value = key.split('.').reduce((current, segment) => current?.[segment], document);
    if (condition && typeof condition === 'object') {
      if ('$in' in condition) return condition.$in.some(candidate => typeof candidate.test === 'function' ? candidate.test(value) : candidate === value);
      if ('$regex' in condition) return condition.$regex.test(value);
      if ('$ne' in condition) return value !== condition.$ne;
      if ('$gte' in condition && value < condition.$gte) return false;
      if ('$lte' in condition && value > condition.$lte) return false;
      return true;
    }
    return value === condition;
  });
}

function harness({ configured = true, connected = true, categories = [], products = [] } = {}) {
  const state = { connected, fail: false, categories, products, seedReads: 0, seedWrites: 0 };
  const vintage = { id: 'cat-vintage', name: 'Vintage & Heritage', slug: 'vintage', active: true };
  const automatic = { id: 'cat-automatic', name: 'Automatic', slug: 'automatic', active: true };
  const sampleProduct = {
    id: 'prod-vintage', name: 'Demo vintage watch', slug: 'demo-vintage-watch', brand: 'Demo',
    category: 'Vintage', description: 'Sample watch.', price: 2999, currency: 'INR', sku: 'DEMO-001',
    stock: 1, availability: 'in_stock', featured: false, status: 'active', specifications: {}, images: [],
  };
  const env = configured ? { MONGODB_URI: 'mongodb://test.invalid/catalogue' } : {};
  const dependencies = {
    '@/lib/mongodb': async () => {
      if (state.fail) throw new Error('Simulated database failure');
      return state.connected ? {} : null;
    },
    mongoose: { isValidObjectId: value => /^[a-f\d]{24}$/i.test(value) },
    '@/lib/mockData': { sampleCategories: [vintage, automatic], sampleProducts: [sampleProduct] },
    '@/lib/utils': { slugify: value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
    '@/lib/imageDelivery': { getBrowserImageUrl: value => value.replace(/\.heic$/i, '.jpg') },
    '@/models/Category': {
      estimatedDocumentCount: async () => { state.seedReads++; return state.categories.length; },
      insertMany: async values => { state.seedWrites++; state.categories.push(...values); },
      find: query => ({ sort: () => ({ lean: async () => state.categories.filter(category => matches(category, query)) }) }),
      findOne: query => ({ lean: async () => state.categories.find(category => matches(category, query)) || null }),
    },
    '@/models/Product': {
      countDocuments: async query => state.products.filter(product => matches(product, query)).length,
      find: query => {
        let skip = 0;
        let limit = Number.POSITIVE_INFINITY;
        const cursor = {
          sort: () => cursor,
          skip: value => { skip = value; return cursor; },
          limit: value => { limit = value; return cursor; },
          lean: async () => state.products.filter(product => matches(product, query)).slice(skip, skip + limit),
        };
        return cursor;
      },
    },
  };
  const categoryService = load('src/services/categoryService.ts', dependencies, env);
  dependencies['@/services/categoryService'] = categoryService;
  const productService = load('src/services/productService.ts', dependencies, env);
  return { state, categoryService, productService, sampleProduct };
}

async function main() {
  const empty = harness();
  assert.equal((await empty.categoryService.getCategories()).length, 0);
  assert.equal((await empty.categoryService.getCategories(false)).length, 0);
  assert.equal(empty.state.seedReads, 0, 'Category reads must not attempt automatic seeding.');
  assert.equal(empty.state.seedWrites, 0);
  assert.equal(await empty.categoryService.getCategoryBySlug('vintage'), null, 'A missing database category must not return its sample equivalent.');
  assert.equal((await empty.productService.getProducts()).total, 0, 'A successful empty database query must not return sample products.');
  assert.equal((await empty.productService.getProducts({ category: 'vintage' })).items.length, 0);

  const inactive = harness({ categories: [{ _id: '100000000000000000000001', name: 'Vintage & Heritage', slug: 'vintage', active: false }] });
  assert.equal((await inactive.categoryService.getCategories()).length, 0);
  assert.equal((await inactive.categoryService.getCategories(false)).length, 1, 'Admins can still read inactive categories.');
  assert.equal(await inactive.categoryService.getCategoryBySlug('vintage'), null);

  const categoryRoute = load('src/app/api/categories/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    'next/cache': { revalidatePath() {}, revalidateTag() {} },
    '@/lib/auth': { getAdminSession: async () => null },
    '@/services/categoryService': inactive.categoryService,
  }, {});
  for (const [query, expected] of [['?active=true', 0], ['', 1], ['?active=false', 1]]) {
    const response = await categoryRoute.GET({ nextUrl: new URL(`https://example.test/api/categories${query}`) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).length, expected, `Category API ${query || 'default'} must preserve its active/default contract.`);
    assert.match(response.headers.get('cache-control') || '', /no-store/i);
  }

  const unavailable = harness({ connected: false });
  assert.equal((await unavailable.categoryService.getCategories(false)).length, 0);
  assert.equal(await unavailable.categoryService.getCategoryBySlug('vintage'), null);
  unavailable.state.fail = true;
  assert.equal((await unavailable.categoryService.getCategories()).length, 0);
  assert.equal(await unavailable.categoryService.getCategoryBySlug('vintage'), null);

  const customName = 'Luxury Sports (Steel)';
  const customSlug = 'weekend-favourites';
  const custom = harness({ categories: [{ _id: '100000000000000000000002', name: customName, slug: customSlug, active: true, image: 'https://example.test/photo.heic' }] });
  custom.state.products.push(
    { ...custom.sampleProduct, _id: '200000000000000000000001', category: customName },
    { ...custom.sampleProduct, _id: '200000000000000000000002', category: customSlug },
    { ...custom.sampleProduct, _id: '200000000000000000000003', category: 'Unlisted legacy name' },
    { ...custom.sampleProduct, _id: '200000000000000000000004', category: customName, status: 'draft' },
  );
  assert.equal((await custom.categoryService.getCategoryBySlug(customSlug)).image, 'https://example.test/photo.jpg', 'Category image normalization must be preserved.');
  for (const category of [customSlug, customName, customName.toLowerCase()]) {
    assert.equal((await custom.productService.getProducts({ category })).total, 2, `Category ${category} must match both stored names and legacy slugs.`);
  }
  assert.equal((await custom.productService.getProducts({ category: customSlug, includeInactive: true })).total, 3);
  assert.equal((await custom.productService.getProducts({ category: 'Unlisted legacy name' })).total, 1, 'Direct category-name filters remain supported.');
  assert.equal((await custom.productService.getProducts({ category: 'Luxury Sports Steel' })).total, 0, 'Category matching must remain exact and escape regex characters.');
  custom.state.categories.length = 0;
  assert.equal(await custom.categoryService.getCategoryBySlug(customSlug), null, 'Deleted categories must stop resolving.');

  const demo = harness({ configured: false, connected: false });
  assert.equal((await demo.categoryService.getCategories()).length, 2);
  assert.equal((await demo.productService.getProducts({ category: 'vintage' })).total, 1);
  assert.equal((await demo.productService.getProducts({ category: 'Vintage & Heritage' })).total, 1, 'Sample name/slug aliases must work in demo mode.');
  await demo.categoryService.updateCategory('cat-vintage', { active: false });
  assert.equal(await demo.categoryService.getCategoryBySlug('vintage'), null);
  await demo.categoryService.deleteCategory('cat-vintage');
  assert.equal((await demo.categoryService.getCategories(false)).length, 1);
  const created = await demo.categoryService.createCategory({ name: customName, slug: customSlug });
  assert.equal((await demo.categoryService.getCategoryBySlug(customSlug)).name, customName);
  await demo.productService.createProduct({ ...demo.sampleProduct, id: undefined, sku: 'DEMO-002', name: 'Custom demo watch', slug: 'custom-demo-watch', category: customName });
  assert.equal((await demo.productService.getProducts({ category: customSlug })).total, 1);
  await demo.categoryService.deleteCategory(created.id);
  assert.equal(await demo.categoryService.getCategoryBySlug(customSlug), null);

  console.log('Category checks passed: no read-time seeds, deleted/inactive categories, active/default/no-store API responses, configured-database failures, empty product queries, custom and legacy category aliases, image normalization, and demo CRUD.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
