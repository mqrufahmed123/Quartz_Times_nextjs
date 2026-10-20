"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Loader2, Watch, Shirt, Footprints } from "lucide-react";
import { IProduct } from "@/types";
import { formatPrice } from "@/lib/utils";
import { getProductWhatsAppUrl } from "@/lib/whatsapp";
import { StorefrontProductEditor } from "@/components/admin/StorefrontProductEditor";

export interface ProductCardProps {
  product: IProduct;
  priority?: boolean;
}
export const ProductCard = ({
  product,
  priority = false,
}: ProductCardProps) => {
  const Placeholder =
    product.productType === "shoes"
      ? Footprints
      : product.productType === "tshirt"
        ? Shirt
        : Watch;
  const [opening, setOpening] = useState(false);
  const [imageState, setImageState] = useState({
    url: "",
    loaded: false,
    failed: false,
  });
  const image =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const loaded = imageState.url === image?.url && imageState.loaded;
  const failed =
    !image?.url || (imageState.url === image.url && imageState.failed);
  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    )
      setOpening(true);
  };
  const type =
    product.productType === "shoes"
      ? "Shoes"
      : product.productType === "tshirt"
        ? "T-shirt"
        : "Watch";
  const status = {
    in_stock: "",
    reserved: "Reserved",
    sold_out: "Sold out",
    made_to_order: "Made to order",
  }[product.availability];
  return (
    <article className="qt-product-card">
      <Link
        href={`/products/${product.slug}`}
        onClick={open}
        aria-label={`View ${product.name}`}
        className="qt-product-photo"
      >
        {!loaded && !failed && (
          <div
            className="absolute inset-0 animate-pulse bg-black/5 motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 qt-muted">
            <Placeholder size={32} strokeWidth={1} />
            <span className="text-xs">Photos coming soon</span>
          </div>
        ) : (
          <Image
            key={image.url}
            src={image.url}
            alt={image.alt || product.name}
            fill
            priority={priority}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 45vw, 30vw"
            onLoad={() =>
              setImageState({ url: image.url, loaded: true, failed: false })
            }
            onError={() =>
              setImageState({ url: image.url, loaded: true, failed: true })
            }
            className={loaded ? "opacity-100" : "opacity-0"}
          />
        )}
        {status && <span className="qt-card-status">{status}</span>}
        {opening && (
          <span
            className="absolute inset-0 flex items-center justify-center bg-black/30"
            role="status"
            aria-label="Opening product"
          >
            <Loader2 className="animate-spin text-white" />
          </span>
        )}
      </Link>
      <div className="qt-product-copy">
        <p className="qt-product-note min-h-[18px]">
          {product.isNewArrival
            ? "Just in"
            : product.featured
              ? "Selected for you"
              : "\u00a0"}
        </p>
        <Link href={`/products/${product.slug}`} onClick={open}>
          <h3 className="qt-product-name">{product.name}</h3>
        </Link>
        <p className="qt-product-meta">
          {product.brand} · {type}
        </p>
        {!!product.variants?.length && (
          <p className="qt-product-meta">
            {new Set(product.variants.map((variant) => variant.color)).size}{" "}
            colours ·{" "}
            {new Set(product.variants.map((variant) => variant.size)).size}{" "}
            sizes
          </p>
        )}
        <div className="qt-card-price">
          <span>{formatPrice(product.price, product.currency)}</span>
          {!!product.originalPrice && product.originalPrice > product.price && (
            <del>{formatPrice(product.originalPrice, product.currency)}</del>
          )}
        </div>
        <a
          href={getProductWhatsAppUrl(product)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ask about ${product.name} on WhatsApp`}
          className="qt-card-action"
        >
          <MessageCircle size={14} />
          <span>Ask on WhatsApp</span>
        </a>
      </div>
      <StorefrontProductEditor product={product} compact />
    </article>
  );
};
