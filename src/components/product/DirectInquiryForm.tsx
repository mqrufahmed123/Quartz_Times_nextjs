'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import { IProduct } from '@/types';
import { getInquiryWhatsAppUrl } from '@/lib/whatsapp';

export interface DirectInquiryFormProps {
  product?: IProduct;
}

export const DirectInquiryForm: React.FC<DirectInquiryFormProps> = ({ product }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    product
      ? `Hi, I am interested in buying the ${product.brand} ${product.name} (SKU: ${product.sku}). Please let me know current availability and delivery process.`
      : 'Hi, I would like to inquire about your watch collection and availability.'
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please provide your name, phone number, and message.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          product: product ? `${product.brand} - ${product.name}` : undefined,
          productId: product?.id || product?._id,
          productSku: product?.sku,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit inquiry.');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to submit inquiry right now.');
    } finally {
      setLoading(false);
    }
  };

  const directWhatsAppUrl = getInquiryWhatsAppUrl({
    name: name || 'Customer',
    product: product ? `${product.brand} ${product.name} (${product.sku})` : undefined,
    message,
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8 transition-colors shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
          Inquire About This Watch
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Send us a message and our team will get back to you right away.
        </p>
      </div>

      {success ? (
        <div className="p-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h4 className="font-serif text-lg font-bold text-emerald-900 dark:text-emerald-200">
            Inquiry Sent Successfully!
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-slate-900 dark:text-white">{name}</strong>. Our team has received your message and will reach out via Phone / WhatsApp shortly.
          </p>
          <div className="pt-2">
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat Directly on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
                WhatsApp / Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
              Your Message *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Submit Inquiry'}</span>
            </button>

            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-300 dark:border-emerald-700/60 text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Instant WhatsApp</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
};
