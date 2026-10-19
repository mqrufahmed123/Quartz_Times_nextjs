'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  MessageCircle,
  Clock,
  MapPin,
  Mail,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';
import { useTheme } from '@/components/common/ThemeProvider';
import { useStorefrontCategories } from './StorefrontCategoriesProvider';

export const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const categories = useStorefrontCategories();

  return (
    <footer className="bg-slate-900 dark:bg-[#070708] border-t border-slate-800 text-slate-300 relative z-20 transition-colors">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-1">
                100% Authentic Guaranteed
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every timepiece is verified by experts for authenticity and condition before reaching your door.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-1">
                Free Insured Delivery
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complimentary insured courier delivery across India with live tracking and secure packaging.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-1">
                Instant WhatsApp Support
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chat with us on WhatsApp for live photos, video inspections, and quick assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-wider text-white">
                QUARTZ TIMES
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-amber-400 font-medium mt-0.5">
                Luxury & Premium Watches
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Quartz Times is your trusted store for luxury Swiss and Japanese watches. Authentic quality, transparent pricing, and fast customer service.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={getGeneralWhatsAppUrl('Footer Hotline')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-400 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {getFormattedWhatsAppDisplay()}</span>
              </a>

              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-full border border-slate-700 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-slate-800 pb-2">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/watches" className="hover:text-amber-400 transition-colors">
                  All Watches
                </Link>
              </li>
              {categories.map(category => <li key={category.slug}>
                <Link href={`/categories/${encodeURIComponent(category.slug)}`} className="hover:text-amber-400 transition-colors">{category.name}</Link>
              </li>)}
            </ul>
          </div>

          {/* Boutique Navigation */}
          <div>
            <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-slate-800 pb-2">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Quartz Times
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about#quality" className="hover:text-amber-400 transition-colors">
                  Quality Inspection
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-500">
                  <Lock className="w-3 h-3" />
                  <span>Admin Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-slate-800 pb-2">
              Customer Support
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Mon – Sat: 10:00 AM – 8:00 PM</p>
                  <p className="text-[11px] text-slate-500">Sunday: Closed</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-200">support@quartztimes.com</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">Mumbai • New Delhi • Bangalore (Insured Pan-India Shipping)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Quartz Times. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">
            Simple & authentic luxury e-commerce experience.
          </p>
        </div>
      </div>
    </footer>
  );
};
