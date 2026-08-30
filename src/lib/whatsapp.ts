/**
 * WhatsApp Business integration utilities
 */

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
}): string {
  const number = getWhatsAppNumber();
  const brandPart = product.brand ? `[${product.brand}] ` : '';
  const skuPart = product.sku ? `\n• Reference/SKU: ${product.sku}` : '';
  const pricePart = product.price
    ? `\n• Listed Price: ${new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: product.currency || 'INR',
        maximumFractionDigits: 0,
      }).format(product.price)}`
    : '';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const productUrl = `${siteUrl}/watches/${encodeURIComponent(product.slug)}`;

  const message = `Hello Quartz Times Horology,

I am interested in inquiring about the following timepiece:
• Watch: ${brandPart}${product.name}${skuPart}${pricePart}

View watch details and photos:
${productUrl}

Could you please share more details regarding current availability, high-resolution media, and acquisition process?

Thank you.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate general boutique concierge WhatsApp inquiry URL
 */
export function getGeneralWhatsAppUrl(subject?: string): string {
  const number = getWhatsAppNumber();
  const subjectLine = subject ? ` regarding ${subject}` : '';

  const message = `Hello Quartz Times Horology,

I would like to speak with a watch advisor${subjectLine}. Could you please assist me with your collection and services?

Thank you.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate bespoke inquiry WhatsApp URL from contact form submission
 */
export function getInquiryWhatsAppUrl(inquiry: {
  name: string;
  product?: string;
  message: string;
}): string {
  const number = getWhatsAppNumber();
  const text = `Hello Quartz Times Horology,

My name is ${inquiry.name}.
${inquiry.product ? `Inquiry regarding: ${inquiry.product}\n` : ''}Message: "${inquiry.message}"

Looking forward to connecting with your concierge team.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
