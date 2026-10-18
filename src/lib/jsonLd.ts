export function serializeJsonLd(value: unknown): string {
  // HTML's parser recognizes </script> even inside an application/ld+json string.
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
