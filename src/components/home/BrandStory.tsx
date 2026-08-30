import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#0A0A0B] relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Photo Pair */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
                alt="Expert Watch Inspection"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            {/* Inset Offset Card */}
            <div className="hidden sm:block absolute -bottom-6 -right-6 w-64 p-5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-amber-500/40 shadow-xl backdrop-blur-md text-slate-900 dark:text-slate-100">
              <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                Our Guarantee
              </span>
              <p className="font-serif text-sm mt-1 font-semibold">
                &ldquo;Every watch in our store is verified 100% authentic with fast, transparent service.&rdquo;
              </p>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
              <History className="w-4 h-4" />
              <span>About Quartz Times</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-slate-100 font-bold leading-tight">
              Simple, Safe & Authentic <br />
              <span className="text-amber-600 dark:text-amber-400">Watch Shopping</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Quartz Times was created to make buying authentic luxury watches straightforward and reliable. We remove complex jargon and middleman markup so you get honest information and smooth service.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Whether you are buying your first automatic watch or adding a rare reference to your collection, our team is available on WhatsApp to answer your questions, send live videos, and arrange fast insured shipping.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-serif text-base text-slate-900 dark:text-slate-100 font-bold mb-1">
                  100% Authentic
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Inspected by watch experts for authenticity and condition before listing.
                </p>
              </div>

              <div>
                <h4 className="font-serif text-base text-slate-900 dark:text-slate-100 font-bold mb-1">
                  Direct WhatsApp Support
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Request live wrist videos, close-up photos, and fast answers in real-time.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline font-bold transition-colors group"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
