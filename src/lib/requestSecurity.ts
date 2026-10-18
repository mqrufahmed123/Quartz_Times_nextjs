import { NextRequest, NextResponse } from 'next/server';

export class RequestError extends Error {
  constructor(message: string, public status = 400, public retryAfter?: number) { super(message); }
}

export function requireSameOrigin(req: NextRequest) {
  let expected = req.nextUrl.origin;
  if (process.env.NODE_ENV === 'production') {
    try { expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || '').origin; }
    catch { throw new RequestError('Site origin is not configured.', 503); }
  }
  if (req.headers.get('origin') !== expected) throw new RequestError('Invalid request origin.', 403);
}

export async function readLimitedText(req: Request, maxBytes = 16 * 1024): Promise<string> {
  if (Number(req.headers.get('content-length')) > maxBytes) throw new RequestError('Request is too large.', 413);
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestError('Request is too large.', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString('utf8');
}

export async function readJson(req: Request): Promise<Record<string, any>> {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new RequestError('Send application/json.', 415);
  }
  const raw = await readLimitedText(req);
  let body;
  try { body = JSON.parse(raw); } catch { throw new RequestError('Invalid JSON.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError('Invalid request body.');
  return body;
}

export function requestErrorResponse(error: unknown, fallback = 'Service temporarily unavailable. Please try again later.') {
  const known = error instanceof RequestError;
  return NextResponse.json({ error: known ? error.message : fallback }, {
    status: known ? error.status : 503,
    headers: known && error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : undefined,
  });
}
