import { permanentRedirect } from 'next/navigation';

// Keep bookmarks and previously shared WhatsApp links valid.
export default async function LegacyProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/products/${encodeURIComponent(slug)}`);
}
