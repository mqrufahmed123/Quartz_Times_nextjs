import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Truck,
  MessageCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-950 border-t border-luxury-800/80 text-luxury-300 relative z-20">
      {/* Value Pillars Banner */}
      <div className="border-b border-luxury-900 bg-luxury-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-luxury-900/40 border border-luxury-800/60">
            <div className="p-3 rounded-full bg-gold/10 text-gold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-luxury-100 uppercase tracking-wider mb-1">
                Guaranteed Authenticity
              </h4>
              <p className="text-xs text-luxury-400 leading-relaxed">
                Every timepiece undergoes a rigorous 32-point inspection by certified master horologists. Full provenance verification.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-luxury-900/40 border border-luxury-800/60">
            <div className="p-3 rounded-full bg-gold/10 text-gold shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-luxury-100 uppercase tracking-wider mb-1">
                Insured Armored Delivery
              </h4>
              <p className="text-xs text-luxury-400 leading-relaxed">
                Complimentary insured courier transit across India with tamper-proof security seals and tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-luxury-900/40 border border-luxury-800/60">
            <div className="p-3 rounded-full bg-gold/10 text-gold shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-luxury-100 uppercase tracking-wider mb-1">
                Personalized Concierge
              </h4>
              <p className="text-xs text-luxury-400 leading-relaxed">
                Direct WhatsApp consultation with our horological advisors for live wrist photos, video walkthroughs, and acquisitions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-widest text-luxury-100">
                QUARTZ TIMES
              </span>
              <span className="block text-[10px] tracking-ultra uppercase text-gold/80 mt-0.5">
                Fine Independent Horology
              </span>
            </Link>
            <p className="text-xs text-luxury-400 leading-relaxed max-w-sm">
              Quartz Times is a premier boutique specializing in the acquisition, curation, and preservation of the world&apos;s finest Swiss and Japanese timepieces.
            </p>
            <div className="pt-2">
              <a
                href={getGeneralWhatsAppUrl('Direct Boutique Hotline')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-luxury-900 border border-gold/40 hover:border-gold text-gold text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {getFormattedWhatsAppDisplay()}</span>
              </a>
            </div>
          </div>

          {/* Curations */}
          <div>
            <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-luxury-100 mb-4 border-b border-luxury-800 pb-2">
              Curated Vault
            </h4>
            <ul className="space-y-2.5 text-xs text-luxury-400">
              <li>
                <Link href="/watches" className="hover:text-gold transition-colors">
                  All Timepieces
                </Link>
              </li>
              <li>
                <Link href="/watches?category=automatic" className="hover:text-gold transition-colors">
                  Automatic Calibres
                </Link>
              </li>
              <li>
                <Link href="/watches?category=chronograph" className="hover:text-gold transition-colors">
                  Chronographs
                </Link>
              </li>
              <li>
                <Link href="/watches?category=vintage" className="hover:text-gold transition-colors">
                  Vintage & Heritage
                </Link>
              </li>
              <li>
                <Link href="/watches?category=dress" className="hover:text-gold transition-colors">
                  Dress Silhouettes
                </Link>
              </li>
              <li>
                <Link href="/watches?category=diver" className="hover:text-gold transition-colors">
                  Diver & Tool Watches
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Navigation */}
          <div>
            <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-luxury-100 mb-4 border-b border-luxury-800 pb-2">
              The Boutique
            </h4>
            <ul className="space-y-2.5 text-xs text-luxury-400">
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  Our Horological Ethos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Private Appointments
                </Link>
              </li>
              <li>
                <Link href="/about#craftsmanship" className="hover:text-gold transition-colors">
                  Master Inspection
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Consignment & Sourcing
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold transition-colors flex items-center gap-1.5 text-luxury-500">
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-luxury-100 mb-4 border-b border-luxury-800 pb-2">
              Concierge Hours
            </h4>
            <div className="space-y-3 text-xs text-luxury-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-luxury-200">Mon – Sat: 10:30 AM – 8:00 PM</p>
                  <p className="text-[11px] text-luxury-500">Sunday: By Appointment Only</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-luxury-200">concierge@quartztimes.com</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-luxury-300">Mumbai • New Delhi • Bangalore (Insured Nationwide Delivery)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="border-t border-luxury-900 bg-luxury-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-luxury-500">
          <p>© {new Date().getFullYear()} Quartz Times Horology. All rights reserved.</p>
          <p className="text-[11px] text-luxury-600">
            All brand trademarks, references, and logos remain the exclusive property of their respective horological houses.
          </p>
        </div>
      </div>
    </footer>
  );
};
