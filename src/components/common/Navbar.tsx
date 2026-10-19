'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  MessageCircle,
  ChevronRight,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { useTheme } from '@/components/common/ThemeProvider';
import { cn } from '@/lib/utils';
import { useStorefrontCategories } from './StorefrontCategoriesProvider';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const categories = useStorefrontCategories();

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

  const categoryLinks = categories.map(category => ({ label: category.name, href: `/categories/${encodeURIComponent(category.slug)}` }));
  const navLinks = [
    { label: 'Shop All', href: '/watches' },
    ...(categoryLinks.length <= 3 ? categoryLinks : []),
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];
  const mobileLinks = [navLinks[0], ...categoryLinks, ...navLinks.slice(-2)];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300 border-b',
          isScrolled
            ? 'bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm py-2 sm:py-3'
            : 'bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-sm border-slate-100 dark:border-slate-900 py-2 sm:py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center xl:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link href="/" className="group flex flex-col items-center sm:items-start">
              <span className="whitespace-nowrap font-serif text-xl sm:text-2xl font-bold tracking-wider text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                QUARTZ TIMES
              </span>
              <span className="text-[10px] tracking-widest uppercase text-amber-600 dark:text-amber-400/80 -mt-0.5 font-medium hidden sm:block">
                Luxury & Premium Watches
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-5">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'max-w-28 truncate text-xs uppercase tracking-wider font-semibold transition-colors py-1 relative group',
                    isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full',
                      isActive && 'w-full'
                    )}
                  />
                </Link>
              );
            })}
            {categoryLinks.length > 3 && <details className="relative shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <summary className="cursor-pointer py-1 uppercase tracking-wider">Categories</summary>
              <div className="absolute left-0 top-full mt-3 max-h-80 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {categoryLinks.map(link => <Link key={link.href} href={link.href} onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')} aria-current={pathname === link.href ? 'page' : undefined} className="block rounded-lg px-3 py-2 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-slate-800 dark:hover:text-amber-400">{link.label}</Link>)}
              </div>
            </details>}
          </nav>

          {/* Header Action Icons */}
          <div className="flex shrink-0 items-center space-x-2 sm:space-x-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Search watches"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle light/dark theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* WhatsApp Link */}
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-50 dark:bg-slate-900 border border-emerald-300 dark:border-slate-700 hover:border-emerald-500 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>

            {/* Admin Entrance */}
            <Link
              href="/admin"
              className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              title="Admin Panel"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Search className="w-5 h-5" />
                <span className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Search Watches
                </span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
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
                placeholder="Search by brand or model (e.g. Rolex, Omega, Seiko, Chronograph)..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Search
              </button>
            </form>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-wider font-medium text-slate-400">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Rolex',
                  'Audemars Piguet',
                  'Patek Philippe',
                  'Omega',
                  'Cartier',
                  'Grand Seiko',
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
                    className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 px-3 py-1.5 rounded-full transition-colors font-medium"
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
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-lg font-bold tracking-wider text-slate-900 dark:text-slate-100"
                >
                  QUARTZ TIMES
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 mb-8">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-3 text-sm text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>

              {/* Theme switch in mobile menu */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mb-6 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Direct WhatsApp Support
                </p>
                <a
                  href={getGeneralWhatsAppUrl('Mobile Menu')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-[11px] text-slate-400 text-center">
              <p>Quartz Times Watch Boutique</p>
              <p className="text-amber-600 dark:text-amber-400 font-medium mt-1">100% Authentic Guarantee</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
