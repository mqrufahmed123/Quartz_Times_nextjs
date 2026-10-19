import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { isIP } from 'node:net';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src/lib/remoteImage.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
let plans = [];
let requests = [];
let dnsCalls = [];
let shortenTimeout = false;
let uuid = 0;
const publicAddress = { address: '93.184.216.34', family: 4 };
const dns = {
  'images.example': [publicAddress],
  'other.example': [{ address: '2606:4700:4700::1111', family: 6 }],
  'private.example': [{ address: '127.0.0.1', family: 4 }],
  'mixed.example': [publicAddress, { address: '10.0.0.1', family: 4 }],
};
function request(url, options, callback) {
  requests.push({ url: url.href, options });
  const plan = plans.shift();
  assert(plan, `Unexpected network request to ${url}`);
  const req = new EventEmitter();
  const aborted = () => req.emit('error', new Error('Aborted'));
  options.signal.addEventListener('abort', aborted, { once: true });
  req.end = () => queueMicrotask(() => {
    // Socket resolution must use the already validated address, never a second DNS lookup.
    options.lookup(url.hostname, { all: false }, (error, address, family) => {
      assert.equal(error, null);
      assert.equal(address, plan.address || publicAddress.address);
      assert.equal(family, plan.family || 4);
    });
    options.lookup(url.hostname, { all: true }, (error, addresses) => {
      assert.equal(error, null);
      assert.equal(addresses[0].address, plan.address || publicAddress.address);
    });
    assert.equal(options.agent, false);
    assert.equal(options.headers.Cookie, undefined);
    assert.equal(options.headers.Authorization, undefined);
    if (plan.stall) return;
    const response = Readable.from(plan.chunks || [plan.body || Buffer.from('89504e470d0a1a0a', 'hex')]);
    response.statusCode = plan.status || 200;
    response.headers = plan.headers || {};
    response.once('close', () => options.signal.removeEventListener('abort', aborted));
    callback(response);
  });
  return req;
}
const sandboxModule = { exports: {} };
vm.runInNewContext(compiled, {
  module: sandboxModule, exports: sandboxModule.exports, Buffer, File, URL, Uint8Array, AbortController,
  setTimeout: (fn, ms) => setTimeout(fn, shortenTimeout ? 5 : ms), clearTimeout,
  require(name) {
    if (name === 'node:crypto') return { randomUUID: () => `unique-${++uuid}` };
    if (name === 'node:net') return { isIP };
    if (name === 'node:http' || name === 'node:https') return { request };
    if (name === 'node:dns/promises') return { lookup: async hostname => {
      dnsCalls.push(hostname);
      if (hostname === 'stall.example') return new Promise(() => {});
      if (!dns[hostname]) throw new Error('No DNS result');
      return dns[hostname];
    } };
    throw new Error(`Unexpected dependency ${name}`);
  },
});
const { downloadRemoteImage, isPublicAddress } = sandboxModule.exports;
function reset(next = []) { plans = [...next]; requests = []; dnsCalls = []; shortenTimeout = false; }
async function failure(url, status) { await assert.rejects(downloadRemoteImage(url), error => error.status === status); }

async function main() {
  for (const address of ['0.0.0.0', '10.1.2.3', '127.0.0.1', '169.254.169.254', '100.100.100.200', '172.16.0.1', '192.168.1.1', '192.0.2.1', '198.18.0.1', '224.0.0.1', '255.255.255.255', '::', '::1', 'fe80::1', 'fc00::1', 'fd12::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '0:0:0:0:0:ffff:a00:1', '64:ff9b::7f00:1', '2001:db8::1', '2002:7f00:1::', 'invalid']) {
    assert.equal(isPublicAddress(address), false, address);
  }
  for (const address of ['8.8.8.8', publicAddress.address, '172.15.0.1', '172.32.0.1', '2606:4700:4700::1111', '2001:4860:4860::8888']) assert.equal(isPublicAddress(address), true, address);
  reset();
  for (const url of ['file:///image.png', 'http://127.1/photo', 'http://2130706433/photo', 'http://0x7f000001/photo', 'http://[::ffff:127.0.0.1]/image', 'https://user:pass@images.example/photo', 'http://images.example:8080/image', 'http://private.example/image', 'http://mixed.example/image']) await failure(url, 400);
  assert.equal(requests.length, 0, 'Private/invalid URLs must never open a socket');

  reset([{}]);
  const png = await downloadRemoteImage('https://images.example/photo');
  assert.equal(png.type, 'image/png');
  assert.match(png.name, /^remote-unique-\d+\.png$/);
  assert.equal(png.size, 8);
  assert.deepEqual(dnsCalls, ['images.example']);
  reset([{ body: Buffer.from('GIF89aimage'), headers: { 'content-type': 'application/octet-stream' } }]);
  const gif = await downloadRemoteImage('http://images.example/no-extension');
  assert.equal(gif.type, 'image/gif');
  assert.notEqual(gif.name, png.name);
  reset([{ status: 302, headers: { location: 'https://other.example/photo' } }, { address: '2606:4700:4700::1111', family: 6 }]);
  assert.equal((await downloadRemoteImage('https://images.example/start')).type, 'image/png');
  assert.deepEqual(dnsCalls, ['images.example', 'other.example']);
  reset([{ status: 302, headers: { location: '/photo.png' } }, {}]);
  assert.equal((await downloadRemoteImage('https://images.example/start')).type, 'image/png');
  assert.equal(requests[1].url, 'https://images.example/photo.png');
  reset([{ status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data' } }]);
  await failure('https://images.example/start', 400);
  assert.equal(requests.length, 1, 'Redirect target must be checked before connecting');
  reset(Array.from({ length: 4 }, () => ({ status: 302, headers: { location: '/again' } })));
  await failure('https://images.example/start', 422);
  assert.equal(requests.length, 4);
  reset([{ status: 403 }]); await failure('https://images.example/photo', 422);
  reset([{ body: Buffer.from('<html>not an image</html>'), headers: { 'content-type': 'image/png' } }]); await failure('https://images.example/photo', 415);
  reset([{ headers: { 'content-encoding': 'gzip' } }]); await failure('https://images.example/photo', 415);
  reset([{ headers: { 'content-length': String(16 * 1024 * 1024) } }]); await failure('https://images.example/photo', 413);
  reset([{ chunks: [Buffer.alloc(10 * 1024 * 1024), Buffer.alloc(6 * 1024 * 1024)] }]); await failure('https://images.example/photo', 413);
  reset([{ body: Buffer.alloc(0) }]); await failure('https://images.example/photo', 415);
  reset([{ stall: true }]); shortenTimeout = true; await failure('https://images.example/slow', 504);
  reset(); shortenTimeout = true; await failure('https://stall.example/photo', 504);
  assert.equal(requests.length, 0, 'Timed out DNS cannot open a later connection');
  console.log('Remote image checks passed: public DNS/socket pinning, private IPv4/IPv6, redirects, signatures, unique filenames, size limits, timeouts, and failures.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
