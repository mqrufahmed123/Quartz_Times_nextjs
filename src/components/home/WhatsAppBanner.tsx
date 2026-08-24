import React from 'react';
import { MessageCircle, ShieldCheck, Clock, Check } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';

export const WhatsAppBanner: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-luxury-950 border-t border-luxury-800 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs uppercase tracking-wider font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Direct Concierge Available</span>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-luxury-100 font-normal leading-tight">
            Acquire Your Next Timepiece with <br />
            <span className="italic text-gold">Personalized Consultation</span>
          </h2>
          <p className="text-sm text-luxury-300 font-light leading-relaxed">
            Have a question about movement health, wish to request live high-definition wrist photography, or arrange a private viewing? Connect directly with our lead horologist on WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-luxury-400">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Instant condition reports</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Live 4K wrist videos</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Secure insured courier arrangement</span>
          </div>
        </div>

        <div className="pt-2">
          <a
            href={getGeneralWhatsAppUrl('Conversion Banner')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-luxury-950 font-bold text-sm uppercase tracking-wider py-4 px-8 rounded-lg shadow-xl hover:shadow-[0_0_30px_-5px_rgba(37,211,102,0.4)] transition-all duration-300 active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Start Conversation on WhatsApp ({getFormattedWhatsAppDisplay()})</span>
          </a>
        </div>
      </div>
    </section>
  );
};
