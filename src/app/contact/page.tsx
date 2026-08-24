import React from 'react';
import { Metadata } from 'next';
import { MessageCircle, Mail, Clock, MapPin, Shield, Phone } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';
import { DirectInquiryForm } from '@/components/product/DirectInquiryForm';

export const metadata: Metadata = {
  title: 'Concierge & Private Appointments | Quartz Times',
  description:
    'Contact Quartz Times horology concierge. Inquire regarding watch acquisitions, bespoke sourcing, or book a private viewing.',
};

export default function ContactPage() {
  return (
    <div className="bg-luxury-950 min-h-screen py-12 sm:py-20 text-luxury-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[11px] uppercase tracking-ultra text-gold font-semibold block">
            Bespoke Client Relations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-luxury-100 font-normal">
            Connect with Our <br />
            <span className="italic text-gold">Horological Concierge</span>
          </h1>
          <p className="text-sm text-luxury-400 font-light leading-relaxed">
            Whether you seek to acquire an available reference, consign a piece from your private collection, or request bespoke sourcing, we invite your inquiry.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-8">
            {/* Primary WhatsApp Direct Callout */}
            <div className="p-6 rounded-xl bg-luxury-900/80 border border-gold/40 shadow-luxury space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-luxury-100">
                    Instant WhatsApp Hotline
                  </h3>
                  <p className="text-xs text-emerald-400">Average response time &lt; 10 mins</p>
                </div>
              </div>

              <p className="text-xs text-luxury-300 leading-relaxed font-light">
                Directly chat with our lead horologist for instant wrist checks, live videos, condition reports, and negotiation.
              </p>

              <a
                href={getGeneralWhatsAppUrl('Contact Page')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-luxury-950 font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat Now ({getFormattedWhatsAppDisplay()})</span>
              </a>
            </div>

            {/* Concierge Details */}
            <div className="p-6 rounded-xl bg-luxury-900/30 border border-luxury-800 space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-luxury-100">
                    Advisory Hours
                  </h4>
                  <p className="text-xs text-luxury-300">
                    Monday to Saturday: 10:30 AM – 8:00 PM IST
                  </p>
                  <p className="text-[11px] text-luxury-500">
                    Sunday: Private Appointments Only
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-luxury-100">
                    Electronic Correspondence
                  </h4>
                  <p className="text-xs text-luxury-300 font-mono">
                    concierge@quartztimes.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-luxury-100">
                    Insured Nationwide Presence
                  </h4>
                  <p className="text-xs text-luxury-300">
                    Mumbai • New Delhi • Bangalore
                  </p>
                  <p className="text-[11px] text-luxury-500">
                    Private viewings arranged by appointment. Armored express courier delivery nationwide.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <DirectInquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
