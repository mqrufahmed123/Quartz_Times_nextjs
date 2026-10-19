'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ArrowUpRight, Loader2, Watch } from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getProductWhatsAppUrl } from '@/lib/whatsapp';
import { Badge } from '@/components/common/Badge';
import { StorefrontProductEditor } from '@/components/admin/StorefrontProductEditor';

export interface ProductCardProps {
  product: IProduct;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const [opening, setOpening] = useState(false);
  const [imageState, setImageState] = useState({ url: '', loaded: false, failed: false });

  const handleOpen = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    setOpening(true);
  };
  const primaryImage =
    product.images?.find((img) => img.isPrimary) ||
    product.images?.[0] || {
      url: 'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=1200&auto=format&fit=crop',
      alt: product.name,
    };
  const imageLoaded = imageState.url === primaryImage.url && imageState.loaded;
  const imageFailed = imageState.url === primaryImage.url && imageState.failed;

  const whatsappUrl = getProductWhatsAppUrl({
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    sku: product.sku,
    price: product.price,
    currency: product.currency,
    images: product.images,
  });

  const availabilityLabels = {
    in_stock: { label: 'In Stock', variant: 'gold' as const },
    reserved: { label: 'Reserved', variant: 'warning' as const },
    sold_out: { label: 'Out of Stock', variant: 'danger' as const },
    made_to_order: { label: 'Pre-Order', variant: 'neutral' as const },
  };

  const avail = availabilityLabels[product.availability] || availabilityLabels.in_stock;

  return (
    <div className="group min-w-0 flex flex-col bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md sm:hover:-translate-y-1">
      {/* Product Image Stage */}
      <Link
        href={`/watches/${product.slug}`}
        onClick={handleOpen}
        aria-label={`View ${product.brand} ${product.name}`}
        className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950 block"
      >
        {!imageLoaded && !imageFailed && (
          <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800 motion-reduce:animate-none" aria-hidden="true" />
        )}

        {imageFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600">
            <Watch className="h-9 w-9" />
            <span className="text-xs font-medium">Photo unavailable</span>
          </div>
        ) : (
          <Image
            key={primaryImage.url}
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setImageState({ url: primaryImage.url, loaded: true, failed: false })}
            onError={() => setImageState({ url: primaryImage.url, loaded: true, failed: true })}
            sizes="(max-width: 1023px) 50vw, 33vw"
            className={`object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        {opening && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/55 backdrop-blur-[2px]" role="status">
            <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg dark:bg-slate-900/95 dark:text-slate-100">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Opening watch...
            </span>
          </div>
        )}

        {/* Top Status Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1 pointer-events-none z-10">
          <Badge variant={avail.variant} size="sm" className="px-1.5 text-[8px] tracking-normal sm:px-2.5 sm:text-[10px] sm:tracking-wider">
            {avail.label}
          </Badge>

          {product.isNewArrival && (
            <Badge variant="dark" size="sm" className="px-1.5 text-[8px] tracking-normal sm:px-2.5 sm:text-[10px] sm:tracking-wider">
              New
            </Badge>
          )}
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <span className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="min-w-0 p-2 sm:p-5 flex flex-col flex-1 justify-between space-y-2 sm:space-y-4">
        <div className="space-y-0 sm:space-y-1.5">
          {/* Brand & Diameter */}
          <div className="hidden sm:flex min-w-0 items-center justify-between gap-2 text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
            <span className="truncate">{product.brand}</span>
            {product.specifications?.caseDiameter && (
              <span className="shrink-0 text-slate-400 font-normal">{product.specifications.caseDiameter}</span>
            )}
          </div>

          {/* Watch Title */}
          <Link href={`/watches/${product.slug}`} onClick={handleOpen} className="block">
            <h3 className="font-sans sm:font-serif text-xs sm:text-lg font-semibold sm:font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 break-words leading-4 sm:leading-snug min-h-8 sm:min-h-0">
              {product.name}
            </h3>
          </Link>

          {/* Movement Teaser */}
          {product.specifications?.movement && (
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate font-normal">
              {product.specifications.movement}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-1.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 sm:gap-2">
          <div className="min-w-0 flex flex-col">
            <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Price
            </span>
            <div className="flex flex-wrap items-baseline gap-x-1 sm:gap-x-2">
              <span className="text-sm sm:text-lg font-sans sm:font-serif font-bold text-slate-900 dark:text-slate-100">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>
          </div>

          {/* WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            aria-label={`Ask about ${product.name} on WhatsApp`}
            className="min-h-9 min-w-9 sm:min-h-0 sm:min-w-0 flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-300 dark:border-emerald-700/60 px-2 sm:px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
      <StorefrontProductEditor product={product} compact />
    </div>
  );
};
