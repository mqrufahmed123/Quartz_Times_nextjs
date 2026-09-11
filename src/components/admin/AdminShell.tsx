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
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'All Watches', href: '/admin/products', icon: Watch },
  { label: 'Add Watch', href: '/admin/products/new', icon: PlusCircle },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Hero Banner', href: '/admin/hero', icon: Sparkles },
  { label: 'Customer Inquiries', href: '/admin/inquiries', icon: MessageSquare },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
      setLoggingOut(false);
    }
  };

  const SidebarLinks = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">
            Admin Menu
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
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors',
                  isActive
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <p className="text-slate-800 dark:text-slate-200 font-bold">Cloudinary & MongoDB</p>
        <p className="text-slate-500">Sync Active</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Navbar */}
      <header className="bg-white dark:bg-[#0A0A0B] border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500 hidden sm:block" />
            <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-slate-900 dark:text-slate-100">
              QUARTZ TIMES
            </span>
            <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 hidden xs:inline font-bold">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <Link
            href="/"
            target="_blank"
            className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-amber-500 font-bold transition-colors hidden sm:flex items-center gap-1.5"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-500 font-bold transition-colors flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-3 py-1.5 rounded-lg"
          >
            {loggingOut ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-300 border-t-rose-600" /> : <LogOut className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0A0A0B] border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-2xl transition-transform duration-300 lg:hidden',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mt-8 flex-1">
            <SidebarLinks />
          </div>
        </div>

        <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0A0A0B] border-r border-slate-200 dark:border-slate-800 p-6 flex-col shrink-0 min-h-[calc(100vh-61px)]">
          <SidebarLinks />
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
