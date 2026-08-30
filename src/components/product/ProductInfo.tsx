import React from 'react';
import {
  MessageCircle,
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getProductWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';
import { Badge } from '@/components/common/Badge';

export interface ProductInfoProps {
  product: IProduct;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const whatsappUrl = getProductWhatsAppUrl({
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    sku: product.sku,
    price: product.price,
    currency: product.currency,
  });

  const availabilityLabels = {
    in_stock: { label: 'In Stock', variant: 'gold' as const },
    reserved: { label: 'Reserved', variant: 'warning' as const },
    sold_out: { label: 'Out of Stock', variant: 'danger' as const },
    made_to_order: { label: 'Pre-Order', variant: 'neutral' as const },
  };

  const avail = availabilityLabels[product.availability] || availabilityLabels.in_stock;

  return (
    <div className="space-y-6">
      {/* Brand & Availability Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
            {product.brand}
          </span>
          <Badge variant={avail.variant} size="md">
            {avail.label}
          </Badge>
        </div>

        {/* Product Title */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-slate-100 font-bold leading-tight">
          {product.name}
        </h1>

        {/* Reference & Condition */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
          {product.sku && (
            <span>
              SKU: <strong className="text-slate-800 dark:text-slate-200 font-mono">{product.sku}</strong>
            </span>
          )}
          {product.specifications?.referenceNumber && (
            <>
              <span>•</span>
              <span>Ref: {product.specifications.referenceNumber}</span>
            </>
          )}
          {product.specifications?.condition && (
            <>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{product.specifications.condition}</span>
            </>
          )}
        </div>
      </div>

      {/* Pricing Card */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
          Price (Taxes Included)
        </span>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="space-y-3 pt-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-lg shadow-md transition-all duration-200 active:scale-[0.99]"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Chat on WhatsApp ({getFormattedWhatsAppDisplay()})</span>
        </a>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
          ⚡ Connect directly for live watch photos, videos, and fast delivery details.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          Watch Description
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
          {product.description}
        </p>

        {product.story && (
          <div className="p-4 rounded-lg bg-amber-500/10 border-l-3 border-amber-500 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            &ldquo;{product.story}&rdquo;
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-slate-900 dark:text-slate-200 block font-semibold">100% Authentic</strong>
            <span className="text-slate-500 dark:text-slate-400">Verified by experts</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <Truck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-slate-900 dark:text-slate-200 block font-semibold">Free Shipping</strong>
            <span className="text-slate-500 dark:text-slate-400">Insured Pan-India delivery</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-slate-900 dark:text-slate-200 block font-semibold">Warranty</strong>
            <span className="text-slate-500 dark:text-slate-400">2-Year guarantee</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-slate-900 dark:text-slate-200 block font-semibold">Box & Papers</strong>
            <span className="text-slate-500 dark:text-slate-400">Complete set</span>
          </div>
        </div>
      </div>
    </div>
  );
};
