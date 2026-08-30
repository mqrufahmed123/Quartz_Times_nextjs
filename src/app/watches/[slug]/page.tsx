import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/services/productService';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { DirectInquiryForm } from '@/components/product/DirectInquiryForm';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { formatPrice } from '@/lib/utils';

export interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: 'Watch Not Found | Quartz Times',
    };
  }

  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.url ||
    product.images?.[0]?.url ||
    '';
  const canonicalPath = `/watches/${product.slug}`;
  const title = `${product.brand} ${product.name} | Quartz Times`;
  const description = `${product.brand} ${product.name} - ${formatPrice(product.price, product.currency)}. 100% Authentic.`;

  return {
    title,
    description: `${product.brand} ${product.name}. ${product.description.substring(0, 150)}... 100% authentic luxury watch with fast WhatsApp support.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalPath,
      images: primaryImage
        ? [{ url: primaryImage, alt: `${product.brand} ${product.name}` }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.slug,
    product.category,
    product.brand,
    4
  );

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
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-[#0A0A0B] min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <Link href="/watches" className="hover:text-amber-500 transition-colors">
            Watches
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <Link
            href={`/watches?category=${product.category.toLowerCase()}`}
            className="hover:text-amber-500 transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none font-semibold">
            {product.name}
          </span>
        </nav>

        {/* Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              video={product.video}
              productName={product.name}
            />
          </div>

          <div className="lg:col-span-5">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Specifications + Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="lg:col-span-7">
            <ProductSpecs
              specifications={product.specifications}
              brand={product.brand}
              category={product.category}
            />
          </div>

          <div className="lg:col-span-5">
            <DirectInquiryForm product={product} />
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
