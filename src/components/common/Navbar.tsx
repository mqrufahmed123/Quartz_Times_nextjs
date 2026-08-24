'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  MessageCircle,
  Shield,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { getGeneralWhatsAppUrl, getFormattedWhatsAppDisplay } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/watches?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Collection', href: '/watches' },
    { label: 'Automatic', href: '/watches?category=automatic' },
    { label: 'Chronographs', href: '/watches?category=chronograph' },
    { label: 'Heritage', href: '/watches?category=vintage' },
    { label: 'Boutique Story', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          isScrolled
            ? 'bg-luxury-950/95 backdrop-blur-md border-b border-luxury-800/80 shadow-luxury py-3.5'
            : 'bg-luxury-950/70 backdrop-blur-sm border-b border-luxury-900 py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-luxury-300 hover:text-gold focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Boutique Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex flex-col items-center sm:items-start">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-luxury-100 group-hover:text-gold transition-colors flex items-center gap-1.5">
                QUARTZ TIMES
                <span className="text-gold text-sm font-normal">✦</span>
              </span>
              <span className="text-[9px] tracking-ultra uppercase text-gold/70 -mt-0.5 hidden sm:block">
                Haute Horology & Fine Timepieces
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/watches'
                  ? pathname === '/watches' && !pathname.includes('?')
                  : pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'text-xs uppercase tracking-widest transition-all duration-200 py-1 relative group font-medium',
                    isActive
                      ? 'text-gold'
                      : 'text-luxury-300 hover:text-luxury-100'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full',
                      isActive && 'w-full'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-luxury-300 hover:text-gold transition-colors rounded-full hover:bg-luxury-900/50"
              aria-label="Search watches"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Direct WhatsApp Concierge Link */}
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-luxury-900 border border-luxury-700 hover:border-gold text-luxury-200 hover:text-gold text-xs uppercase tracking-wider px-3.5 py-2 rounded-full transition-all duration-300"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            {/* Subtle Admin Entrance */}
            <Link
              href="/admin"
              className="p-2 text-luxury-400 hover:text-gold transition-colors opacity-70 hover:opacity-100"
              title="Admin Portal"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-luxury-950/90 backdrop-blur-md flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-luxury-900 border border-luxury-700 rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-luxury-800 pb-4 mb-5">
              <div className="flex items-center gap-2 text-gold">
                <Search className="w-5 h-5" />
                <span className="font-serif text-lg font-medium text-luxury-100">
                  Search Timepiece Vault
                </span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-luxury-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative mb-6">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, reference, model (e.g. Rolex Daytona, Omega, Royal Oak)..."
                className="w-full bg-luxury-950 border border-luxury-700 rounded-lg px-4 py-3.5 text-sm text-luxury-100 placeholder-luxury-500 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-2.5 bg-gold hover:bg-gold-hover text-luxury-950 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Search
              </button>
            </form>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-widest text-luxury-400">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Rolex Daytona',
                  'Audemars Piguet',
                  'Patek Philippe',
                  'Omega Moonwatch',
                  'Cartier Tank',
                  'Grand Seiko Snowflake',
                  'Automatic',
                  'Chronograph',
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      router.push(`/watches?search=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                    }}
                    className="text-xs bg-luxury-950/80 hover:bg-luxury-800 border border-luxury-800 hover:border-luxury-700 text-luxury-300 hover:text-gold px-3 py-1.5 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-luxury-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-luxury-900 border-r border-luxury-800 p-6 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-luxury-800 pb-4 mb-6">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-lg font-bold tracking-widest text-luxury-100"
                >
                  QUARTZ TIMES
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-luxury-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 mb-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-3 text-sm text-luxury-200 hover:text-gold hover:bg-luxury-950/50 rounded-lg transition-colors"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-luxury-500" />
                  </Link>
                ))}
              </div>

              <div className="border-t border-luxury-800 pt-6 space-y-3">
                <p className="text-[11px] uppercase tracking-widest text-luxury-400">
                  Direct Horologist Contact
                </p>
                <a
                  href={getGeneralWhatsAppUrl('Mobile Menu')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-luxury-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="border-t border-luxury-800 pt-4 text-[11px] text-luxury-500 text-center">
              <p>Quartz Times Horology Atelier</p>
              <p className="text-gold/70 mt-1">100% Certified Authentic</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
