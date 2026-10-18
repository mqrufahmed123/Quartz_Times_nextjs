/* eslint-disable @typescript-eslint/no-require-imports */
// Read-only checks by default. --test-order creates one explicitly labelled
// Razorpay TEST order (never a payment and never a live order).
const crypto = require('node:crypto');
require('@next/env').loadEnvConfig(process.cwd());
const mongoose = require('mongoose');

async function main() {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const checks = [];
  const record = (name, passed, detail) => { checks.push({ name, passed, detail }); console.log(`${passed ? 'PASS' : 'CHECK'} ${name}: ${detail}`); };
  record('Payment mode', /^rzp_test_/.test(key || ''), /^rzp_test_/.test(key || '') ? 'Test Mode' : 'Not Test Mode; no test order will be created');
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || '');
    record('Public HTTPS origin', url.protocol === 'https:' && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname), 'Production requires a publicly reachable HTTPS site and webhook');
  } catch { record('Public HTTPS origin', false, 'Missing or invalid site URL'); }
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000, autoIndex: false, autoCreate: false });
      const hello = await mongoose.connection.db.admin().command({ hello: 1 });
      record('MongoDB transactions', !!hello.setName || hello.msg === 'isdbgrid', 'Requires a replica set or sharded cluster');
      let indexes = [];
      try { indexes = await mongoose.connection.db.collection('orders').listIndexes().toArray(); }
      catch (error) { if (error.code !== 26) throw error; }
      for (const field of ['razorpayOrderId', 'razorpayPaymentId']) {
        record(`Unique ${field} index`, indexes.some(i => i.key[field] === 1 && i.unique === true && (i.sparse === true || i.partialFilterExpression)), 'Existing financial indexes must be verified before launch');
      }
      record('Checkout retry index', indexes.some(i => i.key.userId === 1 && i.key.requestId === 1 && i.unique === true), 'Unique userId/requestId required');
    } catch (error) { record('MongoDB readiness', false, `Check failed (${error.name}); connection details omitted`); }
    finally { await mongoose.disconnect(); }
  } else record('MongoDB readiness', false, 'MONGODB_URI missing');
  if (key && secret) {
    try {
      const headers = { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`, 'Content-Type': 'application/json' };
      const response = await fetch('https://api.razorpay.com/v1/orders?count=1', { headers, signal: AbortSignal.timeout(15000) });
      record('Provider authentication', response.ok, `HTTP ${response.status}; no order/customer data printed`);
      if (process.argv.includes('--test-order')) {
        if (!key.startsWith('rzp_test_')) throw new Error('Test Mode required');
        const created = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers,
          body: JSON.stringify({ amount: 100, currency: 'INR', receipt: `qt_check_${crypto.randomBytes(8).toString('hex')}`, notes: { purpose: 'Quartz Times integration readiness test; no payment' } }),
          signal: AbortSignal.timeout(15000) });
        const order = await created.json();
        record('Test provider order creation', created.ok && order.amount === 100 && order.currency === 'INR' && /^order_/.test(order.id), `HTTP ${created.status}; INR 1 test order only, no payment attempted`);
      }
    } catch (error) { record('Provider connectivity', false, `Check failed (${error.name}); credentials omitted`); }
  } else record('Provider authentication', false, 'Credentials missing');
  console.log('Not verified by this script: browser payment completion, capture settings, webhook registration/delivery, refunds.');
  if (checks.some(c => !c.passed)) process.exitCode = 1;
}
main().catch(() => { console.error('Readiness check failed; sensitive details omitted.'); process.exitCode = 1; });
