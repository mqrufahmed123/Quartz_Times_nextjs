"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, MessageCircle, AlertCircle } from "lucide-react";
import { IProduct } from "@/types";
import { getInquiryWhatsAppUrl } from "@/lib/whatsapp";

export interface DirectInquiryFormProps {
  product?: IProduct;
}

export const DirectInquiryForm: React.FC<DirectInquiryFormProps> = ({
  product,
}) => {
  const [variantSku, setVariantSku] = useState("");
  const variant = product?.variants?.find((item) => item.sku === variantSku);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    product
      ? "Is this product available?"
      : "Please share the available products.",
  );

  const inquiryMessage = variant
    ? `${message}\nSize: ${variant.size}\nColour: ${variant.color}\nVariant SKU: ${variant.sku}`
    : message;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("Please provide your name, phone number, and message.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message: inquiryMessage,
          product: product ? `${product.brand} - ${product.name}` : undefined,
          productId: product?.id || product?._id,
          productSku: variant?.sku || product?.sku,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit inquiry.");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to submit inquiry right now.");
    } finally {
      setLoading(false);
    }
  };

  const directWhatsAppUrl = getInquiryWhatsAppUrl({
    name: name || "Customer",
    product: product
      ? `${product.brand} ${product.name} (${product.sku})`
      : undefined,
    message: inquiryMessage,
    images: product?.images,
  });

  return (
    <section
      id="product-inquiry"
      className="qt-inquiry scroll-mt-28"
      aria-labelledby="inquiry-heading"
    >
      <h2 id="inquiry-heading">
        {product ? "Ask us about it." : "Leave us a message."}
      </h2>
      <p className="qt-muted text-sm leading-6 mb-7">
        {product
          ? "A closer look, a size check, or the next steps. We’re here to help."
          : "Share your question and a number where our team can reach you."}
      </p>
      {success ? (
        <div role="status" className="space-y-4 py-5">
          <CheckCircle2 size={32} className="text-emerald-600" />
          <h3 className="text-xl font-medium">Message received.</h3>
          <p className="qt-muted text-sm leading-7">
            Thank you, {name}. Our team will contact you by phone or WhatsApp
            during support hours.
          </p>
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="qt-button qt-button-whatsapp"
          >
            <MessageCircle size={17} /> Continue on WhatsApp
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
          {error && (
            <div
              role="alert"
              className="flex gap-2 text-sm text-rose-600 dark:text-rose-400"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {!!product?.variants?.length && (
            <div>
              <label htmlFor="inquiry-variant">Size & colour (optional)</label>
              <select
                id="inquiry-variant"
                value={variantSku}
                onChange={(event) => setVariantSku(event.target.value)}
              >
                <option value="">Ask about available options</option>
                {product.variants.map((item) => (
                  <option key={item.sku} value={item.sku}>
                    {item.size} / {item.color}
                    {item.stock === 0 ? " (out of stock)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inquiry-name">
                Name <span className="qt-muted">(required)</span>
              </label>
              <input
                id="inquiry-name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="inquiry-phone">
                Phone <span className="qt-muted">(required)</span>
              </label>
              <input
                id="inquiry-phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Including country code"
              />
            </div>
          </div>
          <div>
            <label htmlFor="inquiry-email">
              Email <span className="qt-muted">(optional)</span>
            </label>
            <input
              id="inquiry-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="inquiry-message">
              Message <span className="qt-muted">(required)</span>
            </label>
            <textarea
              id="inquiry-message"
              rows={4}
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          <p className="qt-muted text-xs leading-6">
            We’ll use these details to respond to your inquiry.
          </p>
          <button type="submit" disabled={loading} className="qt-button w-full">
            <Send size={16} />
            {loading ? "Sending your message…" : "Send message"}
          </button>
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="qt-card-action mx-auto !flex justify-center"
          >
            <MessageCircle size={16} /> Prefer WhatsApp? Chat directly
          </a>
        </form>
      )}
    </section>
  );
};
