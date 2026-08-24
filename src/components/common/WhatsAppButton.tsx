'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Shield, Clock } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-xl bg-luxury-900/95 border border-luxury-700 shadow-2xl backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 text-luxury-100">
          <div className="flex items-start justify-between border-b border-luxury-800 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wide text-luxury-100">
                  Quartz Times Concierge
                </h4>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Advisor Active Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-luxury-400 hover:text-white transition-colors p-1"
              aria-label="Close concierge preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-luxury-950/70 rounded-lg p-3 border border-luxury-800/80 mb-3 space-y-1.5 text-xs text-luxury-300">
            <p className="font-medium text-luxury-200">
              Welcome to Quartz Times Horology.
            </p>
            <p className="leading-relaxed">
              Inquire directly with our horologists regarding timepiece availability, high-definition wrist photography, condition reports, or private viewing appointments.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-luxury-400 mb-3 px-1">
            <Shield className="w-3 h-3 text-gold" />
            <span>Direct boutique verification</span>
            <span>•</span>
            <Clock className="w-3 h-3 text-gold" />
            <span>Replies within minutes</span>
          </div>

          <a
            href={getGeneralWhatsAppUrl('Direct Boutique Concierge')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-luxury-950 font-semibold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-all shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp ({getFormattedWhatsAppDisplay()})</span>
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open WhatsApp Concierge"
        className="group relative flex items-center gap-2.5 bg-luxury-900 border border-gold/40 hover:border-gold text-luxury-100 px-4 py-3 rounded-full shadow-luxury hover:shadow-luxury-glow transition-all duration-300 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>

        <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-luxury-950">
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
        </div>

        <span className="text-xs uppercase tracking-wider font-medium text-luxury-200 group-hover:text-gold transition-colors hidden sm:inline">
          Inquire on WhatsApp
        </span>
      </button>
    </div>
  );
};
