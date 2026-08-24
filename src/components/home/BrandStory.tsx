import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, Shield, History } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-luxury-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Pair */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-luxury-900 border border-luxury-800 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
                alt="Watchmaker inspecting movement through loupe"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/80 via-transparent to-transparent" />
            </div>

            {/* Inset Offset Card */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 w-64 p-5 rounded-xl bg-luxury-900/95 border border-gold/40 shadow-2xl backdrop-blur-md">
              <span className="text-[10px] uppercase tracking-ultra text-gold font-medium block">
                Ethos of Authenticity
              </span>
              <p className="font-serif text-sm text-luxury-100 mt-1 font-medium">
                &ldquo;Horology is not merely telling time; it is capturing mechanical art across generations.&rdquo;
              </p>
            </div>
          </div>

          {/* Editorial Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-ultra text-gold font-semibold">
              <History className="w-4 h-4" />
              <span>The Quartz Times Ethos</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-luxury-100 font-normal leading-tight">
              An Independent Haven for <br />
              <span className="italic text-gold">Discerning Collectors</span>
            </h2>

            <p className="text-sm text-luxury-300 leading-relaxed font-light">
              Founded on the belief that fine watchmaking requires uncompromised personal service, Quartz Times bridges the world&apos;s most revered manufactures with serious collectors across India.
            </p>

            <p className="text-sm text-luxury-300 leading-relaxed font-light">
              We bypass corporate impersonal marketplace layers. When you speak with us, you speak directly with seasoned horological curators who examine every movement amplitude, bevel, dial patina, and archive registry before placing a timepiece in your hands.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-luxury-900">
              <div>
                <h4 className="font-serif text-base text-luxury-100 font-semibold mb-1">
                  Provenance First
                </h4>
                <p className="text-xs text-luxury-400 leading-relaxed">
                  Every watch is verified with complete archive documentation, box, and service history.
                </p>
              </div>

              <div>
                <h4 className="font-serif text-base text-luxury-100 font-semibold mb-1">
                  Bespoke Sourcing
                </h4>
                <p className="text-xs text-luxury-400 leading-relaxed">
                  Seeking a rare discontinued reference? Our global network locates museum-grade examples.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-hover font-semibold transition-colors group"
              >
                <span>Read Full Boutique Story</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
