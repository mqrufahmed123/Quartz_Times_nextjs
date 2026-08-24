'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getProductWhatsAppUrl } from '@/lib/whatsapp';
import { Badge } from '@/components/common/Badge';

export interface ProductCardProps {
  product: IProduct;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  // Find primary image or first available image
  const primaryImage =
    product.images?.find((img) => img.isPrimary) ||
    product.images?.[0] || {
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
      alt: product.name,
    };

  const whatsappUrl = getProductWhatsAppUrl({
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    price: product.price,
    currency: product.currency,
  });

  const availabilityLabels = {
    in_stock: { label: 'In Stock', variant: 'gold' as const },
    reserved: { label: 'Reserved', variant: 'warning' as const },
    sold_out: { label: 'Acquired', variant: 'danger' as const },
    made_to_order: { label: 'Sourcing', variant: 'neutral' as const },
  };

  const avail = availabilityLabels[product.availability] || availabilityLabels.in_stock;

  return (
    <div className="group flex flex-col bg-luxury-900/40 border border-luxury-800/80 hover:border-gold/50 rounded-lg overflow-hidden transition-all duration-500 hover:shadow-luxury hover:-translate-y-1">
      {/* Real Watch Photograph Container - Dominant Visual Area */}
      <Link
        href={`/watches/${product.slug}`}
        className="relative aspect-[4/5] sm:aspect-[1/1] w-full overflow-hidden bg-luxury-950 block"
      >
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle Gradient Shadow on Photo Base */}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <Badge variant={avail.variant} size="sm">
            {avail.label}
          </Badge>

          {product.isNewArrival && (
            <Badge variant="dark" size="sm">
              New Addition
            </Badge>
          )}
        </div>

        {/* Floating Quick View Icon on Hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <span className="w-8 h-8 rounded-full bg-luxury-900/90 text-gold border border-gold/40 flex items-center justify-center shadow-lg">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Brand & Reference */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-ultra text-gold font-medium">
            <span>{product.brand}</span>
            {product.specifications?.caseDiameter && (
              <span className="text-luxury-500">{product.specifications.caseDiameter}</span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/watches/${product.slug}`} className="block">
            <h3 className="font-serif text-base sm:text-lg text-luxury-100 group-hover:text-gold transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Movement & Key Specification Teaser */}
          {product.specifications?.movement && (
            <p className="text-xs text-luxury-400 line-clamp-1">
              {product.specifications.movement}
            </p>
          )}
        </div>

        {/* Price & Direct WhatsApp Action */}
        <div className="pt-3 border-t border-luxury-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-luxury-500">
              Listed Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-serif font-bold text-luxury-100">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-luxury-500 line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>
          </div>

          {/* WhatsApp Direct Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Enquire on WhatsApp"
            className="flex items-center justify-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-luxury-950 border border-[#25D366]/40 hover:border-[#25D366] px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95 shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
