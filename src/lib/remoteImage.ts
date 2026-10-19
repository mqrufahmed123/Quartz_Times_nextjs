import { randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP, type LookupFunction } from 'node:net';

const MAX_BYTES = 15 * 1024 * 1024;
const TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

export class RemoteImageError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = 'RemoteImageError';
  }
}

// Only globally routable addresses are eligible. Reject mapped/tunnel IPv6 forms
// as well, so an alternate representation cannot reach a private IPv4 address.
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 192 && b === 88 && c === 99) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113)
    );
  }
  if (family !== 6 || address.includes('%')) return false;
  const [first, second = '0'] = address.toLowerCase().split(':');
  const prefix = parseInt(first || '0', 16);
  const next = parseInt(second || '0', 16);
  return prefix >= 0x2000 && prefix <= 0x3fff &&
    // IETF special-purpose space, documentation, and 6to4 tunnels.
    !(prefix === 0x2001 && (next <= 0x1ff || next === 0xdb8)) &&
    prefix !== 0x2002 && !(prefix === 0x3fff && next <= 0xfff);
}

function parseImageUrl(value: string): URL {
  let url: URL;
  try {
    if (!value || value.length > 8192) throw new Error('Invalid URL');
    url = new URL(value);
  } catch {
    throw new RemoteImageError('Drop a photo or a direct public image link.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) {
    throw new RemoteImageError('Use a public HTTP or HTTPS image link without a login or custom port.');
  }
  url.hash = '';
  return url;
}

async function resolvePublicAddress(url: URL) {
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new RemoteImageError('Only images hosted on a public website can be imported.');
  }
  return addresses.find(({ family }) => family === 4) || addresses[0];
}

function identifyImage(buffer: Buffer): { type: string; extension: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { type: 'image/jpeg', extension: 'jpg' };
  }
  if (buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
    return { type: 'image/png', extension: 'png' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { type: 'image/webp', extension: 'webp' };
  }
  if (['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6))) {
    return { type: 'image/gif', extension: 'gif' };
  }
  if (buffer.length >= 16 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const boxSize = buffer.readUInt32BE(0);
    if (boxSize < 16 || boxSize > buffer.length || boxSize > 4096) return null;
    const brands = [buffer.toString('ascii', 8, 12)];
    for (let offset = 16; offset + 4 <= boxSize; offset += 4) {
      brands.push(buffer.toString('ascii', offset, offset + 4));
    }
    if (brands.some(brand => ['avif', 'avis'].includes(brand))) return { type: 'image/avif', extension: 'avif' };
    if (brands.some(brand => ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs'].includes(brand))) {
      return { type: 'image/heic', extension: 'heic' };
    }
    if (brands.some(brand => ['mif1', 'msf1'].includes(brand))) return { type: 'image/heif', extension: 'heif' };
  }
  return null;
}

type DownloadResult = { redirect: string } | { buffer: Buffer };

async function downloadOnce(url: URL, signal: AbortSignal): Promise<DownloadResult> {
  const address = await resolvePublicAddress(url);
  signal.throwIfAborted();
  // DNS is resolved once, checked, and pinned for the actual socket. Keep the
  // original URL hostname for Host and HTTPS certificate/SNI validation.
  const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
    callback(null, options.all ? [address] : address.address, address.family);
  };
  return new Promise((resolve, reject) => {
    const request = (url.protocol === 'https:' ? httpsRequest : httpRequest)(url, {
      method: 'GET',
      agent: false,
      family: address.family,
      lookup: pinnedLookup,
      signal,
      maxHeaderSize: 16 * 1024,
      headers: {
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,image/heic,image/heif',
        'Accept-Encoding': 'identity',
        'User-Agent': 'QuartzTimes-ImageImporter/1.0',
      },
    }, response => {
      const status = response.statusCode || 0;
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers.location;
        response.destroy();
        if (!location) reject(new RemoteImageError('The image website returned an invalid redirect.', 422));
        else resolve({ redirect: location });
        return;
      }
      if (status !== 200) {
        response.destroy();
        reject(new RemoteImageError('The website did not allow this image download. Save the photo and upload it from your device.', 422));
        return;
      }
      if (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity') {
        response.destroy();
        reject(new RemoteImageError('This image link uses an unsupported download format. Save and upload the photo instead.', 415));
        return;
      }
      if (Number(response.headers['content-length']) > MAX_BYTES) {
        response.destroy();
        reject(new RemoteImageError('Image must be smaller than 15 MB.', 413));
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BYTES) {
          reject(new RemoteImageError('Image must be smaller than 15 MB.', 413));
          response.destroy();
        } else {
          chunks.push(chunk);
        }
      });
      response.once('end', () => resolve({ buffer: Buffer.concat(chunks) }));
      response.once('error', reject);
      response.once('aborted', () => reject(new RemoteImageError('The image download was interrupted. Please try again.', 502)));
    });
    request.once('error', reject);
    request.end();
  });
}

export async function downloadRemoteImage(value: string): Promise<File> {
  const controller = new AbortController();
  const timeoutError = new RemoteImageError('The image download timed out. Save the photo and upload it from your device.', 504);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(timeoutError);
      controller.abort();
    }, TIMEOUT_MS);
  });
  try {
    return await Promise.race([timeout, (async () => {
      let url = parseImageUrl(value);
      for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
        const result = await downloadOnce(url, controller.signal);
        if ('redirect' in result) {
          if (redirects === MAX_REDIRECTS) throw new RemoteImageError('This image link redirects too many times.', 422);
          url = parseImageUrl(new URL(result.redirect, url).href);
          continue;
        }
        const format = identifyImage(result.buffer);
        if (!format) throw new RemoteImageError('This link is not a supported image. Use JPG, PNG, WebP, GIF, AVIF, HEIC, or HEIF.', 415);
        return new File([new Uint8Array(result.buffer)], `remote-${randomUUID()}.${format.extension}`, { type: format.type });
      }
      throw new RemoteImageError('The image could not be downloaded.', 502);
    })()]);
  } catch (error) {
    if (controller.signal.aborted) throw timeoutError;
    if (error instanceof RemoteImageError) throw error;
    throw new RemoteImageError('Unable to download this image. Save the photo and upload it from your device.', 502);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
