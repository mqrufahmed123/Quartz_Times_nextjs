import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/services/productService";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { DirectInquiryForm } from "@/components/product/DirectInquiryForm";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { PRODUCT_TYPES } from "@/lib/productCatalog";
import { formatPrice } from "@/lib/utils";
import { StorefrontProductEditor } from "@/components/admin/StorefrontProductEditor";

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
      title: "Product Not Found",
    };
  }

  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "";
  const canonicalPath = `/products/${product.slug}`;
  const title = `${product.brand} ${product.name}`;
  const description = `${product.brand} ${product.name} - ${formatPrice(product.price, product.currency)}. 100% Authentic.`;

  return {
    title,
    description: `${product.brand} ${product.name}. ${product.description.substring(0, 150)}... 100% authentic product with fast WhatsApp support.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalPath,
      images: primaryImage
        ? [{ url: primaryImage, alt: `${product.brand} ${product.name}` }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
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
    4,
    product.productType || "watch",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.map((img) => img.url) || [],
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "INR",
      availability:
        product.availability === "in_stock"
          ? "https://schema.org/InStock"
          : product.availability === "made_to_order"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="qt-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="qt-container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="qt-breadcrumbs">
          <Link
            href="/"
            className="hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <Link
            href={`/products?productType=${product.productType || "watch"}`}
            className="hover:text-amber-500 transition-colors"
          >
            {
              PRODUCT_TYPES.find(
                (type) => type.value === (product.productType || "watch"),
              )?.label
            }
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
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
        <StorefrontProductEditor product={product} />
        <div className="qt-detail-grid">
          <div className="min-w-0">
            <ProductGallery
              key={JSON.stringify([product.images, product.video])}
              images={product.images}
              video={product.video}
              productName={product.name}
            />
          </div>

          <div className="min-w-0">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Specifications + Inquiry Form */}
        <div className="qt-detail-bottom">
          <div className="min-w-0">
            <ProductSpecs
              productType={product.productType}
              specifications={product.specifications}
              brand={product.brand}
              category={product.category}
            />
          </div>

          <div className="min-w-0">
            <DirectInquiryForm product={product} />
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
