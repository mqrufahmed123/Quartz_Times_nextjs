import React from 'react';
import {
  MessageCircle,
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
  Calendar,
  Share2,
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
    brand: product.brand,
    sku: product.sku,
    price: product.price,
    currency: product.currency,
  });

  const availabilityLabels = {
    in_stock: { label: 'In Stock & Ready for Dispatch', variant: 'gold' as const },
    reserved: { label: 'Currently Reserved', variant: 'warning' as const },
    sold_out: { label: 'Acquired / Inquire for Sourcing', variant: 'danger' as const },
    made_to_order: { label: 'Available via Bespoke Sourcing', variant: 'neutral' as const },
  };

  const avail = availabilityLabels[product.availability] || availabilityLabels.in_stock;

  return (
    <div className="space-y-6">
      {/* Brand & Availability Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-ultra text-gold font-semibold">
            {product.brand}
          </span>
          <Badge variant={avail.variant} size="md">
            {avail.label}
          </Badge>
        </div>

        {/* Product Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-100 font-normal leading-tight">
          {product.name}
        </h1>

        {/* Reference Number & Condition */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-luxury-400 pt-1">
          {product.sku && (
            <span>
              SKU: <strong className="text-luxury-200 font-mono">{product.sku}</strong>
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
              <span className="text-gold/90">{product.specifications.condition}</span>
            </>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="p-4 rounded-xl bg-luxury-900/60 border border-luxury-800 space-y-1">
        <span className="text-[11px] uppercase tracking-widest text-luxury-400">
          Acquisition Price (All Taxes Included)
        </span>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-serif font-bold text-luxury-100">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-luxury-500 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          )}
        </div>
      </div>

      {/* PRIMARY CONVERSION ACTION — DIRECT WHATSAPP BUTTON */}
      <div className="space-y-3 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-luxury-950 font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-lg shadow-lg hover:shadow-[0_0_25px_-5px_rgba(37,211,102,0.4)] transition-all duration-300 active:scale-[0.99]"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Enquire on WhatsApp ({getFormattedWhatsAppDisplay()})</span>
        </a>

        <p className="text-[11px] text-center text-luxury-400 leading-relaxed">
          ⚡ Connect directly with our lead horologist for live wrist photos, video inspections, and immediate escrow/delivery arrangements.
        </p>
      </div>

      {/* Editorial Description */}
      <div className="space-y-3 pt-4 border-t border-luxury-800">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-widest text-luxury-200">
          Horological Description
        </h3>
        <p className="text-sm text-luxury-300 leading-relaxed whitespace-pre-line font-light">
          {product.description}
        </p>

        {product.story && (
          <div className="p-4 rounded-lg bg-luxury-950/70 border-l-2 border-gold text-xs text-luxury-300 italic leading-relaxed">
            &ldquo;{product.story}&rdquo;
          </div>
        )}
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-luxury-800">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-luxury-950/50 border border-luxury-800/60">
          <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-luxury-200 block font-medium">100% Authentic</strong>
            <span className="text-luxury-500">32-point verified</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-luxury-950/50 border border-luxury-800/60">
          <Truck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-luxury-200 block font-medium">Insured Transit</strong>
            <span className="text-luxury-500">All-India express courier</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-luxury-950/50 border border-luxury-800/60">
          <Award className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-luxury-200 block font-medium">2-Year Warranty</strong>
            <span className="text-luxury-500">Quartz Times Guarantee</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-luxury-950/50 border border-luxury-800/60">
          <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <strong className="text-luxury-200 block font-medium">Full Documentation</strong>
            <span className="text-luxury-500">Box & archive papers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
