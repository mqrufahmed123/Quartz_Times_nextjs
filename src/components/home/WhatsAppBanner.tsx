import React from 'react';
import { MessageCircle, Check } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';

export const WhatsAppBanner: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-slate-50 dark:bg-[#0A0A0B] border-t border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Quick Customer Support</span>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-slate-100 font-bold leading-tight">
            Need Help Choosing <br />
            <span className="text-amber-600 dark:text-amber-400">Your Next Watch?</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            Have questions about watch specs, want close-up wrist videos, or need guidance? Connect directly with our team on WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Live photos & videos</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Fast specs verification</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Free insured shipping details</span>
          </div>
        </div>

        <div className="pt-2">
          <a
            href={getGeneralWhatsAppUrl('Conversion Banner')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Chat on WhatsApp ({getFormattedWhatsAppDisplay()})</span>
          </a>
        </div>
      </div>
    </section>
  );
};
