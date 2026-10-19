import React from 'react';
import { ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-slate-900 dark:bg-[#070708] border-b border-slate-800 text-slate-200 dark:text-slate-300 text-[11px] tracking-wider uppercase font-semibold py-2 px-4 relative z-40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Insured Shipping Nationwide</span>
        </div>

        <div className="w-full md:w-auto text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="text-slate-300">Fast Delivery & Support</span>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href={getGeneralWhatsAppUrl('Header Support')}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
