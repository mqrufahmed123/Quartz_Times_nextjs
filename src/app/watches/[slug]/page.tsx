import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Home } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/services/productService';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { DirectInquiryForm } from '@/components/product/DirectInquiryForm';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { formatPrice } from '@/lib/utils';

export interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'Timepiece Not Found | Quartz Times',
    };
  }

  const primaryImage = product.images?.[0]?.url || '';

  return {
    title: `${product.brand} - ${product.name} | Quartz Times Horology`,
    description: `${product.brand} ${product.name}. ${product.description.substring(0, 150)}... Certified authentic luxury timepiece with WhatsApp concierge.`,
    openGraph: {
      title: `${product.brand} ${product.name} | Quartz Times`,
      description: `${product.brand} ${product.name} - ${formatPrice(product.price, product.currency)}. Certified Authentic.`,
      images: primaryImage ? [{ url: primaryImage, alt: product.name }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.slug,
    product.category,
    product.brand,
    4
  );

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img) => img.url) || [],
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'INR',
      availability:
        product.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/UsedCondition',
    },
  };

  return (
    <div className="py-8 sm:py-12 bg-luxury-950 min-h-screen">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Bar */}
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-wider text-luxury-400">
          <Link href="/" className="hover:text-gold transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-luxury-600" />
          <Link href="/watches" className="hover:text-gold transition-colors">
            Vault
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-luxury-600" />
          <Link
            href={`/watches?category=${product.category.toLowerCase()}`}
            className="hover:text-gold transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-luxury-600" />
          <span className="text-luxury-200 truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Primary Stage: Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Dominant Watch Photography Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              video={product.video}
              productName={product.name}
            />
          </div>

          {/* Right: Watch Info, Pricing & WhatsApp Conversion */}
          <div className="lg:col-span-5">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Middle Stage: Specifications Grid + Direct Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-8 border-t border-luxury-900">
          {/* Left: Technical Specifications Table */}
          <div className="lg:col-span-7">
            <ProductSpecs
              specifications={product.specifications}
              brand={product.brand}
              category={product.category}
            />
          </div>

          {/* Right: Concierge Booking / Inquiry Form */}
          <div className="lg:col-span-5">
            <DirectInquiryForm product={product} />
          </div>
        </div>

        {/* Bottom: Related Timepieces */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
