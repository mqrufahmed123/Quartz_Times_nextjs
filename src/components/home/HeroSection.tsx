import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { IHeroSettings } from '@/types';

export interface HeroSectionProps {
  settings?: IHeroSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const badgeText = settings?.badgeText || 'Authentic Watch Boutique';
  const titleLine1 = settings?.titleLine1 || 'TIMECRAFTED';
  const titleHighlight = settings?.titleHighlight || 'PRECISION';
  const subtitle =
    settings?.subtitle ||
    'Discover our handpicked collection of luxury and premium watches. 100% authentic Swiss and Japanese models with fast insured delivery across India.';
  const heroImage =
    settings?.heroImage ||
    'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=1200&auto=format&fit=crop';
  const heroImageAlt = settings?.heroImageAlt || 'Featured Luxury Watch';
  const featuredWatchTitle = settings?.featuredWatchTitle || 'Royal Oak Selfwinding';
  const featuredWatchRef = settings?.featuredWatchRef || 'Ref. 15202ST';
  const featuredWatchLink =
    settings?.featuredWatchLink || '/watches/royal-oak-selfwinding-jumbo-ultra-thin';

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#0A0A0B] pt-6 pb-16 lg:py-20 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      {/* Background Accent Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Text Content */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider shadow-sm mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>

            {/* Headline */}
            <div className="space-y-5">
              <h1 className="font-sans text-[clamp(2rem,6vw,3rem)] sm:text-5xl lg:text-[clamp(3rem,4.5vw,4rem)] font-semibold text-slate-900 dark:text-slate-100 tracking-[-0.035em] leading-[1.15] [text-wrap:balance] break-words">
                <span className="block">{titleLine1}</span>{' '}
                <span className="block text-amber-600 dark:text-amber-400">{titleHighlight}</span>
              </h1>
              <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-[48ch] mx-auto lg:mx-0 font-normal leading-[1.75]">
                {subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/watches"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-lg shadow-md transition-all duration-300 active:scale-95"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={getGeneralWhatsAppUrl('Hero Section')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-300 dark:border-emerald-700/60 font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-lg transition-all duration-300 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Hero Image Stage */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group">
              <Image
                src={heroImage}
                alt={heroImageAlt}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 90vw, 450px"
                unoptimized={heroImage.startsWith('data:')}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

              {/* Floating Featured Watch Card */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg space-y-2 text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  <span>Featured Watch</span>
                  <span className="text-slate-500 dark:text-slate-400">{featuredWatchRef}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                    {featuredWatchTitle}
                  </h3>
                  <Link
                    href={featuredWatchLink}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    View
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Verified Badge */}
            <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2 bg-white dark:bg-slate-800 border border-emerald-400/50 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full shadow-md text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Inspected</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
