import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ArrowRight, ShieldCheck, Compass, Sparkles } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-luxury-950 pt-6 pb-16 lg:py-24 border-b border-luxury-800/80">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-luxury-800/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Editorial Text Content */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Top Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-luxury-900 border border-gold/30 text-gold text-[11px] uppercase tracking-ultra font-medium shadow-sm mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Independent Luxury Horology</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal text-luxury-100 tracking-tight leading-[1.1]">
                TIMELESS <br className="hidden sm:inline" />
                <span className="italic font-light text-gold">PRECISION</span>
              </h1>
              <p className="text-sm sm:text-base text-luxury-300 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Curated timepieces for those who appreciate the details. Rare Swiss and Japanese calibres, verified by master horologists and delivered directly to your collection.
              </p>
            </div>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Primary: Explore Collection */}
              <Link
                href="/watches"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gold hover:bg-gold-hover text-luxury-950 font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-sm shadow-luxury hover:shadow-luxury-glow transition-all duration-300 active:scale-95"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Secondary: Direct WhatsApp Concierge */}
              <a
                href={getGeneralWhatsAppUrl('Hero Section')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-luxury-950 border border-[#25D366]/40 hover:border-[#25D366] font-semibold text-xs uppercase tracking-widest px-7 py-4 rounded-sm transition-all duration-300 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 border-t border-luxury-900 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <span className="block font-serif text-lg sm:text-xl text-luxury-100 font-semibold">
                  100%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-luxury-400">
                  Certified Authentic
                </span>
              </div>
              <div>
                <span className="block font-serif text-lg sm:text-xl text-luxury-100 font-semibold">
                  32-Pt
                </span>
                <span className="text-[10px] uppercase tracking-wider text-luxury-400">
                  Atelier Inspection
                </span>
              </div>
              <div>
                <span className="block font-serif text-lg sm:text-xl text-luxury-100 font-semibold">
                  Insured
                </span>
                <span className="text-[10px] uppercase tracking-wider text-luxury-400">
                  Pan-India Courier
                </span>
              </div>
            </div>
          </div>

          {/* Photography-First Visual Stage */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-luxury-900 border border-luxury-700/60 shadow-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop"
                alt="Audemars Piguet Royal Oak photographed in black gloved studio lighting"
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 90vw, 450px"
              />

              {/* Photo Shadow Layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-transparent to-luxury-950/30 opacity-70" />

              {/* Floating Featured Watch Card Overlay */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-luxury-950/90 backdrop-blur-md border border-luxury-800/90 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-ultra text-gold font-medium">
                  <span>Featured Acquisition</span>
                  <span className="text-luxury-400">Ref. 15202ST</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-semibold text-luxury-100">
                    Royal Oak Selfwinding &ldquo;Jumbo&rdquo;
                  </h3>
                  <Link
                    href="/watches/royal-oak-selfwinding-jumbo-ultra-thin"
                    className="text-xs text-gold hover:underline flex items-center gap-1"
                  >
                    View
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Subtle floating badge */}
            <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 bg-luxury-900/90 border border-gold/40 text-gold px-4 py-2 rounded-full shadow-lg text-xs uppercase tracking-wider backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified In-House</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
