"use client";
import { useState } from "react";
import { MessageCircle, ArrowDown } from "lucide-react";
import { IProduct } from "@/types";
import { formatPrice } from "@/lib/utils";
import { getProductWhatsAppUrl } from "@/lib/whatsapp";
export interface ProductInfoProps {
  product: IProduct;
}
export const ProductInfo = ({ product }: ProductInfoProps) => {
  const [variantSku, setVariantSku] = useState("");
  const selectedVariant = product.variants?.find(
    (variant) => variant.sku === variantSku,
  );
  const status = {
    in_stock: "In stock",
    reserved: "Reserved",
    sold_out: "Sold out",
    made_to_order: "Made to order",
  }[product.availability];
  const type =
    product.productType === "shoes"
      ? "Shoes"
      : product.productType === "tshirt"
        ? "T-shirt"
        : "Watch";
  return (
    <div className="qt-product-info">
      <div className="flex justify-between gap-4 text-sm">
        <span>{product.brand}</span>
        <span className="qt-muted">{status}</span>
      </div>
      <h1>{product.name}</h1>
      <p className="qt-muted text-sm">
        {type}
        {product.specifications?.condition
          ? ` · ${product.specifications.condition}`
          : ""}
      </p>
      <div className="qt-detail-price">
        {formatPrice(product.price, product.currency)}
        {!!product.originalPrice && product.originalPrice > product.price && (
          <del className="ml-3 text-base font-normal qt-muted">
            {formatPrice(product.originalPrice, product.currency)}
          </del>
        )}
      </div>
      <p className="qt-muted text-xs">
        Price shown in {product.currency || "INR"}. Confirm delivery details
        with our team.
      </p>
      {!!product.variants?.length && (
        <fieldset className="mt-8">
          <legend className="text-sm font-medium">Select size & colour</legend>
          <div className="qt-variant-grid">
            {product.variants.map((variant) => (
              <button
                key={variant.sku}
                type="button"
                aria-pressed={variantSku === variant.sku}
                onClick={() =>
                  setVariantSku(variantSku === variant.sku ? "" : variant.sku)
                }
              >
                {variant.size} · {variant.color}
                <span>
                  {variant.stock > 0 ? "In stock" : "Ask about availability"}
                </span>
              </button>
            ))}
          </div>
          <p className="qt-muted text-xs mt-3">
            {selectedVariant
              ? `Your inquiry will include ${selectedVariant.size}, ${selectedVariant.color}.`
              : "Choose an option, or ask us for help with sizing."}
          </p>
        </fieldset>
      )}
      <div className="mt-8 space-y-3">
        <a
          href={getProductWhatsAppUrl({ ...product, variant: selectedVariant })}
          target="_blank"
          rel="noopener noreferrer"
          className="qt-button qt-button-whatsapp w-full"
        >
          <MessageCircle size={18} />
          {product.availability === "sold_out" || selectedVariant?.stock === 0
            ? "Ask about availability"
            : "Inquire on WhatsApp"}
        </a>
        <a
          href="#product-inquiry"
          className="qt-button qt-button-secondary w-full"
        >
          Send an inquiry <ArrowDown size={16} />
        </a>
        <p className="qt-muted text-xs leading-6 text-center">
          Ask for more photos, sizing advice and delivery options.
        </p>
      </div>
      <details open className="qt-accordion mt-6">
        <summary>About this product</summary>
        <p>{product.description}</p>
        {product.story && <p>{product.story}</p>}
      </details>
      <details className="qt-accordion">
        <summary>Product reference</summary>
        <p>
          SKU: {product.sku}
          {product.specifications?.referenceNumber
            ? `\nReference: ${product.specifications.referenceNumber}`
            : ""}
          {product.specifications?.warranty
            ? `\nWarranty: ${product.specifications.warranty}`
            : ""}
        </p>
      </details>
      <details className="qt-accordion">
        <summary>Delivery & personal assistance</summary>
        <p>
          Speak with our team to confirm availability, delivery timing,
          packaging and any included accessories before arranging your purchase.
        </p>
      </details>
    </div>
  );
};
