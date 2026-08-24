import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, Award, Eye, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';
import { CraftsmanshipSection } from '@/components/home/CraftsmanshipSection';

export const metadata: Metadata = {
  title: 'About Our Horological Atelier | Quartz Times',
  description:
    'Discover the philosophy, provenance verification, and craftsmanship behind Quartz Times luxury watch boutique.',
};

export default function AboutPage() {
  return (
    <div className="bg-luxury-950 min-h-screen text-luxury-200">
      {/* Editorial Hero */}
      <section className="py-16 sm:py-24 border-b border-luxury-800/80 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[11px] uppercase tracking-ultra text-gold font-semibold block">
            The Quartz Times Atelier
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-luxury-100 font-normal leading-tight">
            Curating Mechanical Artistry for <br />
            <span className="italic text-gold">Generations of Connoisseurs</span>
          </h1>
          <p className="text-sm sm:text-base text-luxury-300 max-w-2xl mx-auto font-light leading-relaxed">
            We exist for those who see beyond a mere timepiece—for those who value micro-engineering, historical provenance, and honest horological advisory.
          </p>
        </div>
      </section>

      {/* Story Narrative */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 relative aspect-[4/5] rounded-2xl overflow-hidden bg-luxury-900 border border-luxury-800 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop"
                alt="Horologist with loupe examining tourbillon"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-ultra text-gold font-semibold">
                Our Genesis
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-luxury-100 font-normal">
                Born from an Obsession with Precision
              </h2>
              <p className="text-sm text-luxury-300 leading-relaxed font-light">
                Quartz Times was founded with a singular purpose: to create a sanctuary where watch collectors and enthusiasts can acquire genuine, collector-grade timepieces without navigating the pitfalls of generic online marketplaces.
              </p>
              <p className="text-sm text-luxury-300 leading-relaxed font-light">
                Every timepiece we represent is personally handled, verified, timed, and documented by our horologists. We reject fake stock photography and stock claims. What you see is what resides in our climate-controlled vault.
              </p>

              <div className="p-5 rounded-xl bg-luxury-900/60 border border-luxury-800 space-y-2">
                <h4 className="font-serif text-sm font-semibold text-luxury-100">
                  Direct Concierge Relationship
                </h4>
                <p className="text-xs text-luxury-400 leading-relaxed">
                  We believe buying a luxury watch is an intimate milestone. Our WhatsApp direct concierge gives you immediate access to live 4K wrist photos, condition audits, and personalized guidance from start to finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 32-Point Craftsmanship Section */}
      <CraftsmanshipSection />

      {/* Trust & Guarantee Grid */}
      <section className="py-16 sm:py-24 border-t border-luxury-800 bg-luxury-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-ultra text-gold font-semibold block">
              Our Tripartite Promise
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-luxury-100 font-normal">
              Three Non-Negotiable Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-luxury-950 border border-luxury-800 space-y-4">
              <ShieldCheck className="w-8 h-8 text-gold" />
              <h3 className="font-serif text-lg text-luxury-100 font-medium">
                100% Lifetime Authenticity
              </h3>
              <p className="text-xs text-luxury-400 leading-relaxed font-light">
                Every component—from bezel to balance wheel—is guaranteed genuine. We stand behind every watch we deliver with a full refund authenticity guarantee.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-luxury-950 border border-luxury-800 space-y-4">
              <Eye className="w-8 h-8 text-gold" />
              <h3 className="font-serif text-lg text-luxury-100 font-medium">
                Total Photographic Transparency
              </h3>
              <p className="text-xs text-luxury-400 leading-relaxed font-light">
                No filters, no artificial cutouts. We show watches in real studio lighting, on wrists, and under high magnification so you know every nuance before committing.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-luxury-950 border border-luxury-800 space-y-4">
              <Award className="w-8 h-8 text-gold" />
              <h3 className="font-serif text-lg text-luxury-100 font-medium">
                2-Year Certified Guarantee
              </h3>
              <p className="text-xs text-luxury-400 leading-relaxed font-light">
                Every timepiece is covered by our comprehensive Quartz Times mechanical warranty covering movement timing and operational integrity.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center space-y-4">
            <a
              href={getGeneralWhatsAppUrl('About Page Consult')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-luxury-950 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-lg shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Connect with Our Horologist ({getFormattedWhatsAppDisplay()})</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
