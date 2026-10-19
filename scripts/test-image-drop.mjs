import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = new Map();
const fetchCalls = [];
const parserCalls = [];
const origin = 'https://quartz.example';
const compiled = ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/imageDrop.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const sandboxModule = { exports: {} };
vm.runInNewContext(compiled, {
  module: sandboxModule, exports: sandboxModule.exports, URL, File, Uint8Array, atob,
  DOMParser: class {
    parseFromString(html, type) {
      assert.equal(type, 'text/html');
      assert(fixtures.has(html), 'HTML must be parsed with DOMParser');
      parserCalls.push(html);
      return { querySelectorAll(selector) {
        assert.equal(selector, 'img');
        return fixtures.get(html).map(image => ({ currentSrc: image.currentSrc || '', getAttribute: name => name === 'src' ? image.src : null }));
      } };
    }
  },
  fetch: async (url, options) => {
    fetchCalls.push({ url, options });
    return new Response(new Blob(['browser image'], { type: 'image/png' }));
  },
}, { filename: 'src/lib/imageDrop.ts' });
const { readImageDrop, normalizeDroppedImageUrl } = sandboxModule.exports;

function transfer(payload = {}, files = [], items = []) {
  return { files, items, getData: type => payload[type] || '' };
}
function urls(result) { return Array.from(result.urls); }
async function rejects(payload, pattern = /Drop image files/) {
  await assert.rejects(readImageDrop(transfer(payload), origin), pattern);
}

async function main() {
  const file = new File(['a photo'], 'photo.HEIC', { type: 'image/heic' });
  const first = await readImageDrop(transfer({ 'text/html': 'should not parse' }, [file]), origin);
  assert.equal(first.files[0], file);
  assert.equal(first.urls.length, 0, 'Actual files must win over browser URL and HTML duplicates');
  assert.equal(parserCalls.length, 0);
  const itemFile = await readImageDrop(transfer({}, [], [{ kind: 'file', getAsFile: () => file }]), origin);
  assert.equal(itemFile.files[0], file, 'Browsers exposing files through items are supported');

  const linkedImage = '<a href="https://shop.example/watch"><img src="https://photos.example/watch.jpg"></a>';
  fixtures.set(linkedImage, [{ src: 'https://photos.example/watch.jpg' }]);
  const linked = await readImageDrop(transfer({ 'text/html': linkedImage, 'text/uri-list': 'https://shop.example/watch', 'text/plain': 'https://shop.example/watch' }), origin);
  assert.deepEqual(urls(linked), ['https://photos.example/watch.jpg'], 'The image, not its linked product page, must be imported');

  const responsiveImage = '<img src="/fallback.jpg" srcset="/large.jpg 1200w">';
  fixtures.set(responsiveImage, [{ src: '/fallback.jpg', currentSrc: 'https://photos.example/current.jpg' }]);
  assert.deepEqual(urls(await readImageDrop(transfer({ 'text/html': responsiveImage }), origin)), ['https://photos.example/current.jpg']);
  const relativeImage = '<img src="/photo.jpg">';
  fixtures.set(relativeImage, [{ src: '/photo.jpg' }]);
  assert.deepEqual(urls(await readImageDrop(transfer({ 'text/html': relativeImage }), origin)), [`${origin}/photo.jpg`]);

  const list = await readImageDrop(transfer({ 'text/uri-list': '# Browser comments\r\nhttps://photos.example/a.jpg\r\nhttps://photos.example/a.jpg\r\nhttps://photos.example/b.png', 'text/plain': 'https://photos.example/a.jpg' }), origin);
  assert.deepEqual(urls(list), ['https://photos.example/a.jpg', 'https://photos.example/b.png']);
  assert.deepEqual(urls(await readImageDrop(transfer({ 'text/plain': 'https://photos.example/photo.webp' }), origin)), ['https://photos.example/photo.webp']);

  const optimized = `${origin}/_next/image?url=${encodeURIComponent('https://photos.example/watch.heic')}&w=640&q=75`;
  assert.equal(normalizeDroppedImageUrl(optimized, origin), 'https://photos.example/watch.heic');
  assert.equal(normalizeDroppedImageUrl('https://other.example/_next/image?url=https%3A%2F%2Fphotos.example%2Fwatch.jpg', origin), 'https://other.example/_next/image?url=https%3A%2F%2Fphotos.example%2Fwatch.jpg');
  for (const source of ['javascript:alert(1)', 'file:///home/photo.jpg', 'https://admin:password@photos.example/watch.jpg', 'https://photos.example/a\nb.jpg', 'blob:https://other.example/image']) {
    assert.equal(normalizeDroppedImageUrl(source, origin), null, source);
  }

  const embedded = await readImageDrop(transfer({ 'text/plain': 'DATA:image/png;base64,aW1hZ2U=' }), origin);
  assert.equal(embedded.urls.length, 0);
  assert.equal(embedded.files[0].type, 'image/png');
  assert.equal(await embedded.files[0].text(), 'image');
  const percent = await readImageDrop(transfer({ 'text/plain': 'data:image/png,%89PNG%0D%0A' }), origin);
  assert.deepEqual(Array.from(new Uint8Array(await percent.files[0].arrayBuffer())), [137, 80, 78, 71, 13, 10]);
  await rejects({ 'text/plain': 'data:image/svg+xml;base64,PHN2Zz4=' }, /format is not supported/);
  await rejects({ 'text/plain': 'data:image/png;base64,invalid!!' }, /invalid/);
  await rejects({ 'text/plain': 'data:image/png;base64,' }, /empty/);
  await rejects({ 'text/plain': `data:image/png;base64,${'a'.repeat(21 * 1024 * 1024)}` }, /15 MB/);

  const localBlob = `blob:${origin}/image-id`;
  const browserImage = await readImageDrop(transfer({ 'text/plain': localBlob }), origin);
  assert.equal(browserImage.files[0].type, 'image/png');
  assert.equal(await browserImage.files[0].text(), 'browser image');
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, localBlob);
  await rejects({ 'text/plain': 'blob:https://other.example/image' });
  assert.equal(fetchCalls.length, 1, 'Other origins cannot be fetched as browser blob URLs');

  const noImage = '<a href="javascript:alert(1)">text<script>alert(1)</script></a>';
  fixtures.set(noImage, []);
  await rejects({ 'text/html': noImage, 'text/plain': 'a product description' });
  await rejects({ 'text/plain': 'file:///home/photo.jpg' });
  await rejects({ 'text/plain': 'javascript:alert(1)' });
  await rejects({});
  console.log('Image drop checks passed: files, linked/browser images, URL deduplication, Next image sources, bounded embedded images, same-origin blobs, and invalid-drop handling.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
