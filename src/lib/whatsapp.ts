/**
 * WhatsApp Business integration utilities
 */
import type { IProductMedia } from '@/types';

// Click-to-chat supports text, so share a public photo URL rather than an attachment.
function getWatchPhotoText(images: IProductMedia[] = []): string {
  const candidates = [...images.filter((image) => image.isPrimary), ...images];
  for (const image of candidates) {
    try {
      const url = new URL(image.url);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return `\nImage: ${url.href}`;
      }
    } catch {
      // Skip missing or invalid URLs and try another product photo.
    }
  }
  return '';
}

export const getWhatsAppNumber = (): string => {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  // Strip any spaces, dashes, plus signs for the wa.me URL
  return num.replace(/[^0-9]/g, '');
};

export const getFormattedWhatsAppDisplay = (): string => {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  return raw.startsWith('+') ? raw : `+${raw}`;
};

/**
 * Generate a WhatsApp Click-to-Chat URL for a specific product
 */
export function getProductWhatsAppUrl(product: {
  name: string;
  slug: string;
  brand?: string;
  sku?: string;
  price?: number;
  currency?: string;
  images?: IProductMedia[];
}): string {
  const number = getWhatsAppNumber();
  const brandPart = product.brand ? `\nBrand: ${product.brand}` : '';
  const skuPart = product.sku ? `\nSKU: ${product.sku}` : '';
  const pricePart = product.price !== undefined
    ? `\nPrice: ${new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: product.currency || 'INR',
        maximumFractionDigits: 0,
      }).format(product.price)}`
    : '';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const productUrl = `${siteUrl}/watches/${encodeURIComponent(product.slug)}`;

  const message = `Watch: ${product.name}${brandPart}${skuPart}${pricePart}${getWatchPhotoText(product.images)}
Link: ${productUrl}
Query: Is this watch available?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate general boutique concierge WhatsApp inquiry URL
 */
export function getGeneralWhatsAppUrl(subject?: string): string {
  const number = getWhatsAppNumber();
  const message = `Query: ${subject || 'Watch collection'}
Message: Please share more details.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate bespoke inquiry WhatsApp URL from contact form submission
 */
export function getInquiryWhatsAppUrl(inquiry: {
  name: string;
  product?: string;
  message: string;
  images?: IProductMedia[];
}): string {
  const number = getWhatsAppNumber();
  const text = `Name: ${inquiry.name}
${inquiry.product ? `Watch: ${inquiry.product}\n` : ''}Query: ${inquiry.message}${getWatchPhotoText(inquiry.images)}`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
