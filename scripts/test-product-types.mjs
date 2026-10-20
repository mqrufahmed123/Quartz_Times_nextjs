import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import mongoose from 'mongoose';

function load(file, dependencies = {}, env = {}) {
  const sandboxModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    URL, module: sandboxModule, exports: sandboxModule.exports, process: { env }, console: { ...console, error() {}, warn() {} },
    require(name) { assert(name in dependencies, `Unexpected dependency ${name}`); return dependencies[name]; },
  }, { filename: file });
  return sandboxModule.exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const catalogue = load('src/lib/productCatalog.ts');
const validation = load('src/lib/productValidation.ts', { './productCatalog': catalogue });
// Simulate a watch-only model retained across a development hot reload.
mongoose.model('Product', new mongoose.Schema({ name: String }));
const Product = load('src/models/Product.ts', { mongoose }, { NODE_ENV: 'development' }).default;
assert(Product.schema.path('productType'), 'Hot reload must replace the obsolete watch-only model');
assert(Product.schema.path('specifications.material'));
const Inquiry = load('src/models/Inquiry.ts', { mongoose }).default;
const base = {
  name: 'Cotton Tee', slug: 'cotton-tee', brand: 'Test', category: 'Essentials', description: 'Cotton T-shirt',
  productType: 'tshirt', price: 999, currency: 'INR', sku: 'TEE', stock: 999, availability: 'in_stock',
  status: 'active', specifications: { material: 'Cotton', fit: 'Regular' }, images: [],
  variants: [{ sku: ' tee-m ', size: ' M ', color: ' Black ', stock: 3 }, { sku: 'TEE-L', size: 'L', color: 'White', stock: 0 }],
};

// Real Mongoose validation/serialization, without connecting or writing any data.
const persisted = new Product(base);
assert.equal(persisted.validateSync(), undefined);
assert.equal(persisted.variants[0].sku, 'TEE-M');
assert.equal(persisted.specifications.material, 'Cotton');
assert.equal(persisted.variants[0]._id, undefined);
const legacy = new Product({ ...base, productType: undefined, variants: [], specifications: { movement: 'Quartz' } });
assert.equal(legacy.productType, 'watch');
assert(new Product({ ...base, productType: 'hat' }).validateSync());
assert(new Product({ ...base, variants: [{ ...base.variants[0], stock: 1.5 }] }).validateSync());
assert.equal(new Inquiry({ name: 'Customer', phone: '1234567890', message: 'Need size M', productSku: 'TEE-M' }).validateSync(), undefined);

let authenticated = false;
let current = plain(base);
const writes = [];
const paths = [];
const dependencies = {
  '@/lib/productValidation': validation,
  'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
  'next/cache': { revalidatePath: (...args) => paths.push(args), revalidateTag() {} },
  '@/lib/auth': { getAdminSession: async () => authenticated ? { role: 'admin' } : null },
  '@/services/productService': {
    createProduct: async data => { writes.push(plain(data)); return data; },
    getProducts: async query => query,
    getProductById: async () => current,
    updateProduct: async (_id, data) => { writes.push(plain(data)); return { ...current, ...data }; },
    deleteProduct: async () => true,
  },
};
const route = load('src/app/api/products/route.ts', dependencies);
const itemRoute = load('src/app/api/products/[id]/route.ts', dependencies);
const context = { params: Promise.resolve({ id: 'product' }) };
const request = body => ({ json: async () => body });
assert.equal((await route.POST({ json() { throw new Error('Must not read anonymous input'); } })).status, 401);
assert.equal((await itemRoute.PUT(request(base), context)).status, 401);
assert.equal(writes.length, 0);
authenticated = true;
for (const patch of [
  { productType: 'hat' }, { productType: null }, { variants: null }, { variants: {} },
  { variants: [{ ...base.variants[0], stock: -1 }] }, { variants: [{ ...base.variants[0], stock: 0.5 }] },
  { variants: [{ ...base.variants[0], size: '' }] }, { variants: [{ ...base.variants[0], color: { $gt: '' } }] },
  { variants: [{ ...base.variants[0], stock: '2' }] },
  { variants: [{ ...base.variants[0], $set: { stock: 100 } }] },
  { variants: [base.variants[0], { ...base.variants[0], sku: 'OTHER' }] },
  { variants: [base.variants[0], { ...base.variants[1], sku: 'TEE-M' }] },
  { specifications: { movement: 'Quartz' } }, { specifications: { material: { $gt: '' } } },
]) {
  assert.equal((await route.POST(request({ ...base, ...patch }))).status, 400, JSON.stringify(patch));
  assert.equal((await itemRoute.PUT(request({ ...base, ...patch }), context)).status, 400, JSON.stringify(patch));
}
assert.equal(writes.length, 0);
const created = await route.POST(request({ ...base, _id: 'overwrite', $set: { price: 1 } }));
assert.equal(created.status, 201);
assert.equal(writes[0].stock, 3, 'Aggregate stock must ignore a supplied product total.');
assert.equal(writes[0].variants[0].sku, 'TEE-M');
assert.equal(writes[0].variants[0].size, 'M');
assert(!('_id' in writes[0]));
assert(paths.some(([path]) => path === '/products/cotton-tee'));
current = { ...base, variants: plain(writes[0].variants), stock: 3 };
assert.equal((await itemRoute.PUT(request({ featured: true, stock: 999 }), context)).status, 400, 'Partial stock updates cannot disconnect totals from variants.');
assert.equal((await itemRoute.PUT(request({ featured: true }), context)).status, 200);
assert.deepEqual(writes.at(-1), { featured: true }, 'Unrelated edits must not rewrite a stale variant snapshot.');
assert.equal((await itemRoute.PUT(request({ specifications: { material: 'Linen' } }), context)).status, 200, 'Partial specifications use the persisted product type.');
assert.equal((await itemRoute.PUT(request({ specifications: { movement: 'Quartz' } }), context)).status, 400);
assert.equal((await itemRoute.PUT(request({ variants: [{ sku: 'TEE-M', size: 'M', color: 'Black', stock: 0 }] }), context)).status, 200);
assert.equal(writes.at(-1).availability, 'sold_out');
assert.equal((await itemRoute.PUT(request({ variants: [], stock: 5 }), context)).status, 200);
assert.equal(writes.at(-1).variants.length, 0);
assert.equal(writes.at(-1).stock, 5);
const query = await (await route.GET({ url: 'https://example.test/api/products?productType=shoes&size=UK%208&color=Black&page=2' })).json();
assert.equal(query.productType, 'shoes'); assert.equal(query.size, 'UK 8'); assert.equal(query.color, 'Black'); assert.equal(query.page, 2);

// Exercise the same catalogue cases through Mongo query construction and demo reads.
function matches(doc, query) {
  return Object.entries(query).every(([key, rule]) => {
    const value = key.split('.').reduce((current, part) => current?.[part], doc);
    if (rule instanceof RegExp || typeof rule?.test === 'function') return rule.test(value);
    if (rule && typeof rule === 'object') {
      if ('$in' in rule) return rule.$in.some(item => item === value || item === null && value == null);
      if ('$elemMatch' in rule) return value?.some(item => matches(item, rule.$elemMatch));
      if ('$gt' in rule) return value > rule.$gt;
      if ('$regex' in rule) return rule.$regex.test(value);
    }
    return value === rule;
  });
}
const products = [
  { ...base, id: 'legacy', slug: 'old-watch', productType: undefined, variants: [], specifications: { movement: 'Quartz' } },
  { ...base, id: 'tee', variants: plain(writes[0].variants) },
  { ...base, id: 'shoes', slug: 'sneakers', productType: 'shoes', specifications: { upperMaterial: 'Leather' }, variants: [
    { sku: 'S-8', size: 'UK 8', color: 'Black', stock: 0 },
    { sku: 'S-9', size: 'UK 9', color: 'White', stock: 2 },
  ] },
  { ...base, id: 'hidden', status: 'draft' },
];
for (const connected of [false, true]) {
  const service = load('src/services/productService.ts', {
    '@/lib/mongodb': async () => connected ? {} : null,
    mongoose: { isValidObjectId: () => false },
    '@/lib/mockData': { sampleProducts: products },
    '@/lib/utils': { slugify: value => value },
    '@/lib/imageDelivery': { getBrowserImageUrl: value => value },
    '@/services/categoryService': { getCategories: async () => [] },
    '@/models/Product': {
      countDocuments: async query => products.filter(item => matches(item, query)).length,
      find: query => {
        let skip = 0, limit = 50;
        const cursor = { sort: () => cursor, skip: value => { skip = value; return cursor; }, limit: value => { limit = value; return cursor; }, lean: async () => products.filter(item => matches(item, query)).slice(skip, skip + limit) };
        return cursor;
      },
    },
  });
  assert.equal((await service.getProducts()).total, 3);
  assert.equal((await service.getProducts({ productType: 'watch' })).items[0].id, 'legacy');
  assert.equal((await service.getProducts({ productType: 'tshirt' })).total, 1);
  assert.equal((await service.getProducts({ productType: 'shoes' })).total, 1);
  assert.equal((await service.getProducts({ productType: 'shoes', size: 'UK 8', color: 'White' })).total, 0, 'Size and colour must match the same variant.');
  assert.equal((await service.getProducts({ size: 'UK 8', color: 'Black' })).total, 1);
  assert.equal((await service.getProducts({ size: 'UK 8', color: 'Black', availability: 'in_stock' })).total, 0, 'A sold-out size cannot match the in-stock filter.');
  assert.equal((await service.getProducts({ size: 'uk 9', color: 'white', availability: 'in_stock' })).total, 1);
  assert.equal((await service.getProducts({ size: 'UK .*' })).total, 0, 'Size filters must escape regular expressions.');
  assert.equal((await service.getRelatedProducts('cotton-tee', undefined, undefined, 4, 'tshirt')).length, 0, 'Related items stay in the same product type.');
}
const whatsapp = load('src/lib/whatsapp.ts', {}, { NEXT_PUBLIC_SITE_URL: 'https://example.test' });
const message = new URL(whatsapp.getProductWhatsAppUrl({ ...base, variant: { sku: 'TEE-M', size: 'M', color: 'Black', stock: 3 } })).searchParams.get('text');
assert.match(message, /Size: M/); assert.match(message, /Colour: Black/); assert.match(message, /SKU: TEE-M/); assert.match(message, /https:\/\/example.test\/products\/cotton-tee/);
console.log('Product type checks passed: schema defaults, footwear/clothing specifications, optional inquiry email, protected create/update, invalid and duplicate variants, stock totals, partial updates, Mongo/demo filter parity, same-variant matching, related products, and WhatsApp selections.');
