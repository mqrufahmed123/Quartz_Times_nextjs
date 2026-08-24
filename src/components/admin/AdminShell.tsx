'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Watch,
  FolderTree,
  MessageSquare,
  PlusCircle,
  X,
  Menu,
  ExternalLink,
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'All Watches', href: '/admin/products', icon: Watch },
  { label: 'Add Timepiece', href: '/admin/products/new', icon: PlusCircle },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Client Inquiries', href: '/admin/inquiries', icon: MessageSquare },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const SidebarLinks = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-ultra text-luxury-500 font-semibold px-3 mb-2">
            Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors',
                  isActive
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'text-luxury-400 hover:text-luxury-100 hover:bg-luxury-900'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-luxury-900/60 border border-luxury-800 text-[11px] text-luxury-400 space-y-1">
        <p className="text-luxury-200 font-medium">Cloudinary & MongoDB</p>
        <p className="text-luxury-500">Autonomous Server Sync Active</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-luxury-950 text-luxury-100 flex flex-col">
      {/* ── Admin Navbar ── */}
      <header className="bg-luxury-950 border-b border-luxury-800 py-3.5 px-4 sm:px-6 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle — in navbar top-left */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 text-luxury-300 hover:text-gold transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold hidden sm:block" />
            <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-luxury-100">
              QUARTZ TIMES
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gold bg-gold/15 px-2 py-0.5 rounded border border-gold/30 hidden xs:inline">
              Atelier
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            target="_blank"
            className="text-xs uppercase tracking-wider text-luxury-300 hover:text-gold transition-colors hidden sm:flex items-center gap-1.5"
          >
            <span>View Boutique</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/60 px-2.5 sm:px-3 py-1.5 rounded"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Body: Sidebar + Content ── */}
      <div className="flex-1 flex relative">

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-luxury-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 bg-luxury-950 border-r border-luxury-800 p-6 flex flex-col shadow-2xl transition-transform duration-300 lg:hidden',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-luxury-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mt-8 flex-1">
            <SidebarLinks />
          </div>
        </div>

        {/* Desktop sidebar — always visible */}
        <aside className="hidden lg:flex w-64 bg-luxury-950 border-r border-luxury-800 p-6 flex-col shrink-0 min-h-[calc(100vh-61px)]">
          <SidebarLinks />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
