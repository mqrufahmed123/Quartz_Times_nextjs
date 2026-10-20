import { NextRequest, NextResponse, userAgent } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) {
    const { device, isBot } = userAgent(request);
    if (!isBot && device.type === 'mobile') {
      const destination = request.nextUrl.clone();
      destination.pathname = '/products';
      const response = NextResponse.redirect(destination);
      // Device-specific redirects must not be reused for desktop visitors.
      response.headers.set('Cache-Control', 'private, no-store');
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
