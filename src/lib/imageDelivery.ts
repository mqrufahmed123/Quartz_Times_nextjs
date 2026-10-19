/** Deliver existing Cloudinary HEIC assets as JPEGs without changing stored originals. */
export function getBrowserImageUrl(source: string): string {
  try {
    const url = new URL(source);
    if (
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.includes('/image/upload/') &&
      /\.(heic|heif)$/i.test(url.pathname)
    ) {
      url.pathname = url.pathname.replace(/\.(heic|heif)$/i, '.jpg');
      return url.href;
    }
  } catch {
    // Local paths and data URLs continue through their existing delivery path.
  }
  return source;
}
