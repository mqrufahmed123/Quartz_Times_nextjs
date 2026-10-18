'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

export interface CheckoutModalProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
}

let sdkPromise: Promise<boolean> | null = null;
function loadRazorpayScript(): Promise<boolean> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    const failed = () => { clearTimeout(timer); script.remove(); sdkPromise = null; resolve(false); };
    const timer = setTimeout(failed, 15000);
    script.onload = () => { clearTimeout(timer); if ((window as any).Razorpay) resolve(true); else failed(); };
    script.onerror = failed;
    document.body.appendChild(script);
  });
  return sdkPromise;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const requestId = useRef('');
  const dialog = useRef<HTMLDivElement>(null);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [isClientLoggedIn, setIsClientLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    requestId.current = crypto.randomUUID();
    setLoading(false);
    setError('');
    setPrepared(false);
    setSubmittedOrderId('');
    setIsClientLoggedIn(null);
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    // Check if user is logged in
    fetch('/api/auth/user-me')
      .then((res) => res.json())
      .then((data) => {
        setIsClientLoggedIn(Boolean(data.authenticated));
        if (data.user?.phone) setPhone(current => current || data.user.phone);
      })
      .catch(() => setIsClientLoggedIn(false));

    loadRazorpayScript();
    return () => previousFocus?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=1200&auto=format&fit=crop';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isClientLoggedIn === false) {
      // Redirect to login with return path
      const returnUrl = `/watches/${product.slug}`;
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay payment SDK. Please check your connection.');
      }

      // 1. Create order on server
      const createRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id || (product as any)._id,
          shippingAddress: {
            street,
            city,
            state,
            postalCode,
            country: 'India',
            phone,
          },
          quantity: 1,
          requestId: requestId.current,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        if (createRes.status === 401) {
          router.push(`/login?redirect=${encodeURIComponent(`/watches/${product.slug}`)}`);
          return;
        }
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      // 2. Open Razorpay Checkout modal
      setPrepared(true);
      const options = {
        key: orderData.keyId,
        amount: orderData.razorpayOrder.amount,
        currency: orderData.razorpayOrder.currency,
        name: 'Quartz Times',
        description: `${product.brand} - ${product.name}`,
        image: 'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=120&auto=format&fit=crop',
        order_id: orderData.razorpayOrder.id,
        timeout: Math.max(1, Math.floor((Date.parse(orderData.localOrder.reservationExpiresAt) - Date.now()) / 1000)),
        theme: {
          color: '#D97706',
        },
        handler: async function (response: any) {
          setSubmittedOrderId(orderData.localOrder.id);
          try {
            setLoading(true);
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                localOrderId: orderData.localOrder.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Cryptographic payment verification failed.');
            }

            onClose();
            router.push(`/orders/${verifyData.orderId}`);
          } catch (verErr: any) {
            console.error('Verification error:', verErr);
            setError(verErr.message || 'Payment completed, but verification failed. Contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', () => {
        setError('Payment was not completed. You can retry in the payment window while your reservation is active.');
      });
      rzpInstance.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Checkout could not be completed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Watch checkout"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !loading) onClose();
          if (event.key !== 'Tab') return;
          const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]');
          if (!controls?.length) return;
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }} className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
              Secure Instant Checkout
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close checkout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watch Summary */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              {product.brand}
            </span>
            <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {product.name}
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              SKU: {product.sku}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase tracking-wider">Total</span>
            <span className="font-serif text-base font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCheckout} className="p-6 space-y-4">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
          {submittedOrderId && <a href={`/orders/${submittedOrderId}`} className="block text-sm text-amber-700 dark:text-amber-400 underline">Check your payment and order status before trying again</a>}
          {prepared && <p className="text-xs text-slate-500">Delivery details are saved for this checkout. To change them, let this hold expire before starting again.</p>}

          {isClientLoggedIn === false && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
              <span>You must be signed in to complete your order.</span>
              <button
                type="button"
                onClick={() =>
                  router.push(`/login?redirect=${encodeURIComponent(`/watches/${product.slug}`)}`)
                }
                className="font-bold underline text-amber-600 dark:text-amber-400 ml-2"
              >
                Sign In Now
              </button>
            </div>
          )}

          <fieldset disabled={prepared || loading} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Insured Nationwide Delivery Address
            </h4>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">
                Street Address / Apartment *
              </label>
              <input
                type="text"
                required
                value={street}
                aria-label="Street address"
                maxLength={300}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Flat 4B, Prestige Towers, MG Road"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  aria-label="City"
                  maxLength={100}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  aria-label="State"
                  maxLength={100}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  aria-label="Postal PIN code"
                  pattern="[1-9][0-9]{5}"
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="400001"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">
                Contact Phone (For Delivery Coordination) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                aria-label="Delivery contact phone"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </fieldset>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>One watch per checkout. Your watch is held for 15 minutes while you pay.</span>
          </div>

          <button
            type="submit"
            disabled={loading || isClientLoggedIn === null || !!submittedOrderId}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay {formatPrice(product.price, product.currency)} via Razorpay</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
