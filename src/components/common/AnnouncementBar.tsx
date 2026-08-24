import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-luxury-950 border-b border-luxury-800/80 text-luxury-300 text-[11px] tracking-widest uppercase font-medium py-2 px-4 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-gold/80">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Insured Delivery</span>
        </div>

        <div className="w-full md:w-auto text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-gold animate-pulse" />
          <span>Curated Swiss & Japanese Watches</span>
          <span className="hidden sm:inline text-luxury-600">•</span>
          <span className="hidden sm:inline text-luxury-400">Direct WhatsApp Concierge</span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-luxury-400">
          <a
            href={getGeneralWhatsAppUrl('Bespoke Appointment')}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span>VIP Appointment</span>
          </a>
        </div>
      </div>
    </div>
  );
};
