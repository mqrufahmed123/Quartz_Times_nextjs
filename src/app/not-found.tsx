import React from 'react';
import Link from 'next/link';
import { Watch, ArrowLeft, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-luxury-950 px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-luxury-900 border border-luxury-800 text-gold flex items-center justify-center mx-auto">
          <Watch className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-ultra text-gold font-semibold">
            404 — Reference Not Found
          </span>
          <h1 className="font-serif text-3xl text-luxury-100 font-normal">
            A Timepiece Lost to the Vault
          </h1>
          <p className="text-xs text-luxury-400 font-light leading-relaxed">
            The page or reference number you requested may have been relocated, archived, or is no longer listed in our collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/watches"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-luxury-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vault</span>
          </Link>

          <a
            href={getGeneralWhatsAppUrl('404 Inquire Sourcing')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-luxury-900 hover:bg-luxury-800 text-luxury-200 border border-luxury-800 text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Ask Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
