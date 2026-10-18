import React from 'react';
import { Metadata } from 'next';
import { MessageCircle, Mail, Clock, MapPin } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';
import { DirectInquiryForm } from '@/components/product/DirectInquiryForm';

export const metadata: Metadata = {
  title: 'Contact Us | Quartz Times',
  description:
    'Contact Quartz Times customer support. Message us on WhatsApp or fill out the form for quick assistance.',
};

export default function ContactPage() {
  return (
    <div className="bg-slate-50 dark:bg-[#0A0A0B] min-h-screen py-12 sm:py-20 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
            Customer Support
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
            Get in Touch with <br />
            <span className="text-amber-600 dark:text-amber-400">Quartz Times</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            Whether you want to buy a watch, ask about specifications, or check delivery status, we are here to help.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Card */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-500/40 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <MessageCircle className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                    Instant WhatsApp Support
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Fast response time (&lt; 10 mins)</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Chat directly with our watch team for live videos, photos, price inquiries, and quick answers.
              </p>

              <a
                href={getGeneralWhatsAppUrl('Contact Page')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat Now ({getFormattedWhatsAppDisplay()})</span>
              </a>
            </div>

            {/* Support Details */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                    Support Hours
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Monday to Saturday: 10:00 AM – 8:00 PM IST
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sunday: Closed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                    Email Support
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    support@quartztimes.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                    Locations & Delivery
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Mumbai • New Delhi • Bangalore
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Free insured courier delivery across India on all orders.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <DirectInquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
