/* eslint-disable @typescript-eslint/no-require-imports -- This CommonJS test harness installs a TypeScript require hook. */
// Compile the application TypeScript in memory so tests exercise the real helpers
// and services without adding a test framework or writing generated source files.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const project = path.resolve(__dirname, '..');
require('@next/env').loadEnvConfig(project);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...rest) {
  return originalResolve.call(this, name.startsWith('@/') ? path.join(project, 'src', name.slice(2)) : name, ...rest);
};
Module._extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } }).outputText, filename);
};
const { validSignature, amountInPaise, assertPaymentMatches, checkoutInput } = require('../src/lib/paymentValidation.ts');
let checks = 0;
async function check(name, run) { await run(); checks++; console.log(`PASS ${name}`); }

async function main() {
  await check('signature rejects missing, truncated, wrong and tampered payloads', () => {
    const signature = crypto.createHmac('sha256', 'fixture-secret').update('order_1|pay_1').digest('hex');
    assert(validSignature('order_1|pay_1', signature, 'fixture-secret'));
    for (const value of [null, '', signature.slice(1), 'g'.repeat(64), '0'.repeat(64)]) assert.equal(validSignature('order_1|pay_1', value, 'fixture-secret'), false);
    assert.equal(validSignature('order_2|pay_1', signature, 'fixture-secret'), false);
  });
  await check('money conversion rejects zero, fractional paise and unsafe amounts', () => {
    assert.equal(amountInPaise(1234.56), 123456);
    for (const value of [0, -1, NaN, Infinity, 0.001, Number.MAX_SAFE_INTEGER]) assert.throws(() => amountInPaise(value));
  });
  await check('captured payment must match stored order, currency and amount', () => {
    const order = { razorpayOrderId: 'order_1', totalAmount: 1234.56, currency: 'INR' };
    const payment = { id: 'pay_1', order_id: 'order_1', amount: 123456, currency: 'INR', status: 'captured' };
    assertPaymentMatches(order, payment);
    for (const change of [{ amount: 1 }, { order_id: 'order_other' }, { currency: 'USD' }, { status: 'authorized' }]) assert.throws(() => assertPaymentMatches(order, { ...payment, ...change }));
  });
  await check('checkout ignores browser amount and rejects invalid quantities and mock IDs', () => {
    const input = { productId: 'a'.repeat(24), requestId: crypto.randomUUID(), quantity: 1, amount: 1,
      shippingAddress: { street: 'Test Street', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India', phone: '9999999999' } };
    assert.equal(checkoutInput(input).amount, undefined);
    for (const quantity of [0, -1, 1.5, 2, '1', null]) assert.throws(() => checkoutInput({ ...input, quantity }));
    assert.throws(() => checkoutInput({ ...input, productId: 'prod-1' }));
    assert.throws(() => checkoutInput({ ...input, shippingAddress: { ...input.shippingAddress, country: 'US' } }));
  });
  await check('JSON-LD cannot terminate its HTML script element', () => {
    const { serializeJsonLd } = require('../src/lib/jsonLd.ts');
    const value = { name: '</script><script>alert(1)</script>', description: '<!-- Unicode ₹ -->' };
    const serialized = serializeJsonLd(value);
    assert.equal(serialized.includes('<'), false);
    assert.deepEqual(JSON.parse(serialized), value);
  });
  await check('public inquiries strip workflow fields, bound strings and allow optional email', () => {
    const { inquiryInput } = require('../src/lib/inquiryValidation.ts');
    const input = { name: 'Test', phone: '+91 99999 99999', message: 'Question', status: 'closed', notes: 'forged', _id: 'forged' };
    const result = inquiryInput(input);
    assert.equal(result.status, 'new'); assert.equal(result.notes, ''); assert.equal(result._id, undefined); assert.equal(result.email, '');
    assert.throws(() => inquiryInput({ ...input, message: 'x'.repeat(3001) }));
    assert.throws(() => inquiryInput({ ...input, name: { $ne: null } }));
  });
  await check('body limits apply to chunked requests, not just content-length', async () => {
    const { readLimitedText, readJson } = require('../src/lib/requestSecurity.ts');
    await assert.rejects(readLimitedText(new Request('http://localhost/test', { method: 'POST', body: 'x'.repeat(100) }), 50), e => e.status === 413);
    await assert.rejects(readJson(new Request('http://localhost/test', { method: 'POST', body: 'null', headers: { 'content-type': 'application/json' } })), e => e.status === 400);
  });
  await routes();
  if (process.argv.includes('--integration')) await integration();
  console.log(`${checks} commerce checks passed.`);
}

async function routes() {
  const { NextRequest } = require('next/server');
  const userAuth = require('../src/lib/userAuth.ts');
  const service = require('../src/services/orderService.ts');
  const limits = require('../src/lib/rateLimit.ts');
  const provider = require('../src/lib/razorpay.ts');
  const cache = require('next/cache');
  const modules = [userAuth, service, limits, provider, cache];
  const saved = modules.map(m => ({ ...m }));
  const oldSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const oldFetch = global.fetch;
  const oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  process.env.RAZORPAY_WEBHOOK_SECRET = 'fixture-webhook-secret';
  let session = { userId: 'a'.repeat(24), name: 'Test', email: 'test@example.invalid' };
  const order = { id: 'b'.repeat(24), userId: session.userId, totalAmount: 1234.56, currency: 'INR',
    status: 'pending', paymentStatus: 'pending', razorpayOrderId: 'order_fixture', items: [{ slug: 'test-watch' }],
    reservationExpiresAt: new Date(Date.now() + 600_000).toISOString() };
  let captures = 0;
  userAuth.getUserSession = async () => session;
  service.getOrderById = async () => order;
  service.createPendingOrder = async () => ({ ...order, razorpayOrderId: undefined });
  service.claimProviderCreation = async () => true;
  service.attachRazorpayOrderId = async () => {};
  service.fulfillOrder = async payment => {
    assertPaymentMatches(order, payment); captures++; return order;
  };
  limits.enforceRateLimit = async () => {};
  provider.razorpayConfig = () => ({ keyId: 'rzp_test_fixture', secret: 'fixture-api-secret' });
  provider.razorpayRequest = async (resource, body) => {
    assert.equal(resource, 'orders'); assert.equal(body.amount, 123456); assert.equal(body.currency, 'INR');
    return { id: 'order_fixture', amount: 123456, currency: 'INR' };
  };
  cache.revalidatePath = () => {}; cache.revalidateTag = () => {};
  global.fetch = () => { throw new Error('Unexpected network access in route tests'); };
  const request = (path, body, headers = {}) => new NextRequest(`http://localhost${path}`, {
    method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  try {
    const create = require('../src/app/api/checkout/create-order/route.ts').POST;
    const verify = require('../src/app/api/checkout/verify-payment/route.ts').POST;
    const webhook = require('../src/app/api/checkout/webhook/route.ts').POST;
    await check('checkout routes reject anonymous, cross-origin and malformed requests', async () => {
      const current = session; session = null;
      assert.equal((await create(request('/api/checkout/create-order', {}))).status, 401);
      session = current;
      assert.equal((await create(request('/api/checkout/create-order', {}, { origin: 'https://attacker.invalid' }))).status, 403);
      assert.equal((await create(request('/api/checkout/create-order', 'null'))).status, 400);
    });
    await check('create-order sends server amount and retains ambiguous provider claim', async () => {
      const body = { productId: 'c'.repeat(24), requestId: crypto.randomUUID(), amount: 1, shippingAddress: { street: 'Test', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', phone: '9999999999' } };
      const response = await create(request('/api/checkout/create-order', body));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).razorpayOrder.amount, 123456);
      service.claimProviderCreation = async () => false;
      assert.equal((await create(request('/api/checkout/create-order', body))).status, 409);
    });
    await check('callback enforces ownership and HMAC without marking payment captured', async () => {
      const body = { localOrderId: order.id, razorpayOrderId: order.razorpayOrderId, razorpayPaymentId: 'pay_fixture', razorpaySignature: '0'.repeat(64) };
      const current = session; session = { ...session, userId: 'c'.repeat(24) };
      assert.equal((await verify(request('/api/checkout/verify-payment', body))).status, 404);
      session = current;
      assert.equal((await verify(request('/api/checkout/verify-payment', body))).status, 400);
      body.razorpaySignature = crypto.createHmac('sha256', 'fixture-api-secret').update('order_fixture|pay_fixture').digest('hex');
      const response = await verify(request('/api/checkout/verify-payment', body));
      assert.equal(response.status, 200); assert.equal((await response.json()).paymentStatus, 'pending'); assert.equal(captures, 0);
    });
    await check('webhook rejects forged and tampered raw bodies; valid capture reaches fulfillment', async () => {
      const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_fixture', order_id: 'order_fixture', amount: 123456, currency: 'INR', status: 'captured' } } } });
      const signature = crypto.createHmac('sha256', 'fixture-webhook-secret').update(raw).digest('hex');
      assert.equal((await webhook(request('/api/checkout/webhook', raw, { 'x-razorpay-signature': '0'.repeat(64) }))).status, 400);
      assert.equal((await webhook(request('/api/checkout/webhook', raw + ' ', { 'x-razorpay-signature': signature }))).status, 400);
      assert.equal(captures, 0);
      assert.equal((await webhook(request('/api/checkout/webhook', raw, { 'x-razorpay-signature': signature }))).status, 200);
      assert.equal(captures, 1);
    });
  } finally {
    modules.forEach((m, i) => Object.assign(m, saved[i]));
    global.fetch = oldFetch;
    if (oldSecret === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET; else process.env.RAZORPAY_WEBHOOK_SECRET = oldSecret;
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldNodeEnv;
  }
}

async function integration() {
  require('@next/env').loadEnvConfig(project);
  if (!process.env.MONGODB_URI) throw new Error('MongoDB configuration is required for integration tests.');
  const mongoose = require('mongoose');
  const dbName = `qt_commerce_test_${crypto.randomBytes(8).toString('hex')}`;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName, serverSelectionTimeoutMS: 8000 });
    global.mongooseCache ||= { conn: null, promise: null };
    global.mongooseCache.conn = mongoose;
    global.mongooseCache.promise = null;
    const Product = require('../src/models/Product.ts').default;
    const Order = require('../src/models/Order.ts').default;
    const User = require('../src/models/User.ts').default;
    const service = require('../src/services/orderService.ts');
    const userAuth = require('../src/lib/userAuth.ts');
    const adminAuth = require('../src/lib/auth.ts');
    await check('customer password hashes and seven-day JWTs cannot grant admin access', async () => {
      const password = 'test-password-only';
      const hash = await userAuth.hashUserPassword(password);
      assert.notEqual(hash, password);
      assert(await userAuth.compareUserPassword(password, hash));
      assert.equal(await userAuth.compareUserPassword('wrong', hash), false);
      const payload = { userId: new mongoose.Types.ObjectId().toString(), name: 'Test', email: 'fixture@example.invalid' };
      const token = await userAuth.createUserSessionToken(payload);
      assert.equal((await userAuth.verifyUserSessionToken(token)).userId, payload.userId);
      assert.equal(await adminAuth.verifySessionToken(token), null);
      const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
      assert.equal(claims.exp - claims.iat, 7 * 24 * 60 * 60);
      const adminToken = await adminAuth.createSessionToken({ userId: payload.userId, email: payload.email, role: 'admin' });
      assert.equal(await userAuth.verifyUserSessionToken(adminToken), null);
    });
    await Promise.all([Product.init(), Order.init(), User.init()]);
    const users = await User.create([{ name: 'Fixture One', email: 'one@example.invalid', passwordHash: 'unused' }, { name: 'Fixture Two', email: 'two@example.invalid', passwordHash: 'unused' }]);
    const userId = String(users[0]._id);
    const product = await Product.create({ name: 'Test Watch', slug: 'test-watch', brand: 'Test', category: 'Test', description: 'Integration fixture', price: 1234.56, currency: 'INR', sku: 'TEST-1', stock: 1, status: 'active', availability: 'in_stock' });
    const params = { userId, productId: String(product._id), requestId: crypto.randomUUID(), customer: { name: 'Test', email: 'fixture@example.invalid', phone: '9999999999' }, shippingAddress: { street: 'Test', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India' } };
    let order;
    await check('competing checkouts reserve the last watch only once', async () => {
      const results = await Promise.allSettled([service.createPendingOrder(params), service.createPendingOrder({ ...params, userId: String(users[1]._id), requestId: crypto.randomUUID() })]);
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
      order = results.find(r => r.status === 'fulfilled').value;
      params.userId = order.userId;
      assert.equal(order.totalAmount, 1234.56);
      const stored = await Product.findById(product._id);
      assert.equal(stored.stock, 1); assert.equal(stored.reservedStock, 1);
    });
    await check('checkout retry returns the same order and hold', async () => {
      const stored = await Order.findById(order.id);
      const retry = await service.createPendingOrder({ ...params, requestId: stored.requestId });
      assert.equal(retry.id, order.id);
      assert.equal((await Product.findById(product._id)).reservedStock, 1);
    });
    await check('new request IDs resume the same hold; changed address cannot silently pay', async () => {
      const retry = await service.createPendingOrder({ ...params, requestId: crypto.randomUUID() });
      assert.equal(retry.id, order.id);
      assert.equal((await Product.findById(product._id)).reservedStock, 1);
      await assert.rejects(service.createPendingOrder({ ...params, requestId: crypto.randomUUID(), shippingAddress: { ...params.shippingAddress, street: 'Different address' } }), e => e.status === 409);
    });
    await check('provider order creation can be claimed only once', async () => {
      const claims = await Promise.all([service.claimProviderCreation(order.id), service.claimProviderCreation(order.id)]);
      assert.equal(claims.filter(Boolean).length, 1);
    });
    await service.attachRazorpayOrderId(order.id, 'order_fixture');
    const payment = { id: 'pay_fixture', order_id: 'order_fixture', amount: 123456, currency: 'INR', status: 'captured' };
    await check('wrong amount leaves stock and order unchanged', async () => {
      await assert.rejects(service.fulfillOrder({ ...payment, amount: 1 }));
      assert.equal((await Order.findById(order.id)).paymentStatus, 'pending');
      assert.equal((await Product.findById(product._id)).stock, 1);
    });
    await check('concurrent duplicate captures fulfill and decrement exactly once', async () => {
      await Promise.all([service.fulfillOrder(payment), service.fulfillOrder(payment)]);
      const stored = await Product.findById(product._id);
      assert.equal(stored.stock, 0); assert.equal(stored.reservedStock, 0); assert.equal(stored.availability, 'sold_out');
      assert.equal((await Order.findById(order.id)).status, 'paid');
    });
    await check('replay after shipping does not decrement or reset fulfillment', async () => {
      await service.updateOrderStatus(order.id, 'processing');
      await service.updateOrderStatus(order.id, 'shipped');
      await service.fulfillOrder(payment);
      assert.equal((await Order.findById(order.id)).status, 'shipped');
      assert.equal((await Product.findById(product._id)).stock, 0);
      await assert.rejects(service.updateOrderStatus(order.id, 'paid'));
    });
    await check('expired reservation releases stock; late capture cannot oversell', async () => {
      const second = await Product.create({ name: 'Test Watch 2', slug: 'test-watch-2', brand: 'Test', category: 'Test', description: 'Fixture', price: 10, sku: 'TEST-2', stock: 1, status: 'active', availability: 'in_stock' });
      const p = { ...params, productId: String(second._id), requestId: crypto.randomUUID() };
      const old = await service.createPendingOrder(p);
      await service.attachRazorpayOrderId(old.id, 'order_expired');
      await Order.updateOne({ _id: old.id }, { reservationExpiresAt: new Date(0) });
      await service.createPendingOrder({ ...p, requestId: crypto.randomUUID() });
      const late = await service.fulfillOrder({ id: 'pay_late', order_id: 'order_expired', amount: 1000, currency: 'INR', status: 'captured' });
      assert.equal(late.paymentStatus, 'captured'); assert(late.fulfillmentIssue);
      const stored = await Product.findById(second._id);
      assert.equal(stored.stock, 1); assert.equal(stored.reservedStock, 1);
    });
    await check('shared request budgets permit exactly the configured concurrent attempts', async () => {
      const { enforceRateLimit } = require('../src/lib/rateLimit.ts');
      const results = await Promise.allSettled(Array.from({ length: 12 }, () => enforceRateLimit('fixture', 'account', 3, 60_000)));
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 3);
      for (const r of results.filter(r => r.status === 'rejected')) assert.equal(r.reason.status, 429);
    });
    await check('parallel checkout for different watches cannot evade the customer hold quota', async () => {
      const u = await User.create({ name: 'Quota Fixture', email: 'quota@example.invalid', passwordHash: 'unused' });
      const products = await Product.create([3, 4].map(n => ({ name: `Fixture ${n}`, slug: `quota-${n}`, brand: 'Test', category: 'Test', description: 'Fixture', price: 10, sku: `QUOTA-${n}`, stock: 2, status: 'active', availability: 'in_stock' })));
      const attempts = await Promise.allSettled(products.map(p => service.createPendingOrder({ ...params, userId: String(u._id), productId: String(p._id), requestId: crypto.randomUUID() })));
      assert.equal(attempts.filter(r => r.status === 'fulfilled').length, 1);
      assert.equal(await Order.countDocuments({ userId: String(u._id), reservationActive: true }), 1);
    });
    await check('public inquiry persistence cannot forge status and accepts blank email', async () => {
      const { createInquiry } = require('../src/services/inquiryService.ts');
      const result = await createInquiry({ name: 'Fixture', phone: '9999999999', message: 'Test', status: 'closed', notes: 'forged' });
      assert.equal(result.status, 'new'); assert.equal(result.notes, ''); assert.equal(result.email, '');
    });
    await check('repeated abandoned holds cannot be renewed without a cooldown', async () => {
      const u = await User.create({ name: 'Cooldown', email: 'cooldown@example.invalid', passwordHash: 'unused' });
      const p = await Product.create({ name: 'Cooldown', slug: 'cooldown', brand: 'Test', category: 'Test', description: 'Fixture', price: 10, sku: 'COOLDOWN', stock: 1, status: 'active', availability: 'in_stock' });
      const input = { ...params, userId: String(u._id), productId: String(p._id) };
      for (let i = 0; i < 3; i++) {
        const hold = await service.createPendingOrder({ ...input, requestId: crypto.randomUUID() });
        await Order.updateOne({ _id: hold.id }, { reservationExpiresAt: new Date(0) });
      }
      await assert.rejects(service.createPendingOrder({ ...input, requestId: crypto.randomUUID() }), e => e.status === 429);
      assert.equal(await Order.countDocuments({ userId: String(u._id) }), 3);
    });
  } finally {
    // This is a newly created random test database, never the configured application DB.
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName && /^qt_commerce_test_[a-f0-9]{16}$/.test(dbName)) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}
main().catch(error => {
  console.error(error instanceof assert.AssertionError ? error.message : `Commerce checks failed (${error.name}, ${error.code || 'no code'}): database connectivity, transaction support or service validation needs inspection.`);
  process.exitCode = 1;
});
