import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { ShieldCheck, Award, Eye, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';
import { CraftsmanshipSection } from '@/components/home/CraftsmanshipSection';

export const metadata: Metadata = {
  title: 'About Us | Quartz Times',
  description:
    'Learn about Quartz Times, our authenticity guarantees, quality checks, and customer support philosophy.',
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 dark:bg-[#0A0A0B] min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
            About Quartz Times
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Authentic Luxury Watches <br />
            <span className="text-amber-600 dark:text-amber-400">Simple & Reliable</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            We provide verified, 100% authentic Swiss and Japanese watches with transparent descriptions, real photos, and direct WhatsApp support.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
                alt="Watch Inspection"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Our Mission
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                Clear Answers & Genuine Quality
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Quartz Times was created to take the confusion and hype out of watch buying. We replace complicated marketing terms with clear specs, exact condition reports, and genuine photos.
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Every watch in our inventory is thoroughly inspected for physical condition, timing accuracy, and authenticity before it is offered for sale.
              </p>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                  Direct WhatsApp Support
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Want to see a watch on a wrist before ordering? Message us anytime for live high-definition videos, close-up photos, and fast answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Inspection Section */}
      <CraftsmanshipSection />

      {/* Key Guarantees */}
      <section className="py-16 sm:py-24 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
              Our Promise
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              3 Reasons to Shop with Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
              <h3 className="font-serif text-lg font-bold">
                100% Authentic Guarantee
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Every component is verified genuine. We stand behind every watch we sell with a 100% authenticity guarantee.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <Eye className="w-8 h-8 text-amber-500" />
              <h3 className="font-serif text-lg font-bold">
                Real Photos & Videos
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                No stock photography or fake renderings. What you see in photos and videos is the exact watch you receive.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <Award className="w-8 h-8 text-amber-500" />
              <h3 className="font-serif text-lg font-bold">
                2-Year Mechanical Warranty
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Every watch comes covered by our 2-year warranty for timing precision and internal movement health.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <a
              href={getGeneralWhatsAppUrl('About Page')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-lg shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with Us on WhatsApp ({getFormattedWhatsAppDisplay()})</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
