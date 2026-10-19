import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(relative, dependencies = {}, env = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const sandboxModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: sandboxModule, exports: sandboxModule.exports, Buffer, URL, File,
    process: { env },
    console,
    require(name) {
      assert(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: relative });
  return sandboxModule.exports;
}

async function main() {
  const delivery = load('src/lib/imageDelivery.ts');
  const original = 'https://res.cloudinary.com/example/image/upload/v123/watches/IMG_2550.heic';
  assert.equal(delivery.getBrowserImageUrl(original), original.replace('.heic', '.jpg'));
  assert.equal(delivery.getBrowserImageUrl(original.replace('.heic', '.HEIF') + '?test=1'), original.replace('.heic', '.jpg') + '?test=1');
  for (const url of ['https://images.example/watch.heic', 'data:image/heic;base64,example', '/watch.heic', original.replace('.heic', '.png')]) {
    assert.equal(delivery.getBrowserImageUrl(url), url);
  }

  const uploads = [];
  const cloud = load('src/lib/cloudinary.ts', {
    cloudinary: { v2: {
      config() {},
      uploader: { upload_stream(options, callback) {
        uploads.push(options);
        return { end(buffer) {
          assert(buffer.length > 0);
          callback(null, { secure_url: original.replace('.heic', '.jpg'), public_id: 'watches/test', format: 'jpg', width: 100, height: 100 });
        } };
      } },
    } },
  });
  let authenticated = true;
  let imported = [];
  class RemoteImageError extends Error {
    constructor(message, status) { super(message); this.status = status; }
  }
  const dependencies = {
    'node:crypto': { randomUUID: () => 'unique-upload' },
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/auth': { getAdminSession: async () => authenticated ? { role: 'admin' } : null },
    '@/lib/cloudinary': cloud,
    '@/lib/imageDelivery': delivery,
    '@/lib/remoteImage': { RemoteImageError, downloadRemoteImage: async url => {
      imported.push(url);
      if (url.endsWith('/blocked')) throw new RemoteImageError('Only public image URLs can be imported.', 400);
      return new File([Buffer.from('GIF89aimage')], 'remote-test.gif', { type: 'image/gif' });
    } },
  };
  const configured = { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'test', CLOUDINARY_API_SECRET: 'test' };
  const route = load('src/app/api/upload/route.ts', dependencies, configured);
  const heicHeader = Buffer.from('000000186674797068656963000000006d69663168656963', 'hex');
  function request(name, type, bytes = heicHeader) {
    const data = new FormData();
    data.set('type', 'image');
    data.set('file', new File([bytes], name, { type }));
    return { formData: async () => data };
  }
  for (const [filename, mime] of [
    ['photo.HEIC', 'image/heic'], ['photo.HEIF', ''],
    ['photo.heic', 'application/octet-stream'], ['photo.heic', 'image/heic-sequence'],
    ['photo.jpg', 'image/jpeg'], // HEIC content mislabeled as JPEG is still converted.
  ]) {
    const response = await route.POST(request(filename, mime));
    assert.equal(response.status, 200);
    assert.equal(uploads.at(-1).format, 'jpg');
    assert.equal((await response.json()).format, 'jpg');
  }
  await route.POST(request('photo.png', 'image/png', Buffer.from('png')));
  assert.equal(uploads.at(-1).format, undefined, 'PNG uploads retain transparency and format');

  const local = load('src/app/api/upload/route.ts', dependencies);
  assert.equal((await local.POST(request('photo.heic', 'image/heic'))).status, 503);
  const png = await local.POST(request('photo.png', 'image/png', Buffer.from('png')));
  assert.equal(png.status, 200);
  assert((await png.json()).url.startsWith('data:image/png;base64,'));

  const jsonRequest = imageUrl => ({ headers: new Headers({ 'Content-Type': 'application/json' }), json: async () => ({ imageUrl }) });
  assert.equal((await route.POST(jsonRequest('https://images.example/photo'))).status, 200);
  assert.equal(imported.length, 1);
  assert.equal(uploads.at(-1).public_id, 'unique-upload');
  assert.equal((await route.POST(jsonRequest('https://images.example/blocked'))).status, 400);
  assert.equal((await route.POST(jsonRequest(''))).status, 400);
  assert.equal((await route.POST(jsonRequest(42))).status, 400);
  const localImport = await local.POST(jsonRequest('https://images.example/photo'));
  assert.equal(localImport.status, 200);
  assert((await localImport.json()).url.startsWith('data:image/gif;base64,'));

  authenticated = false;
  assert.equal((await route.POST({ formData() { throw new Error('Must authenticate first'); } })).status, 401);
  const importsBefore = imported.length;
  assert.equal((await route.POST({ headers: new Headers({ 'Content-Type': 'application/json' }), json() { throw new Error('Must authenticate before URL import'); } })).status, 401);
  assert.equal(imported.length, importsBefore);
  console.log('Media checks passed: HEIC/HEIF JPEG conversion options, MIME fallbacks, existing URLs, PNG preservation, local fallback, upload authorization.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
