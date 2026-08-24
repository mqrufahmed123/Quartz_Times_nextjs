'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Watch,
  FolderTree,
  MessageSquare,
  PlusCircle,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const links = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'All Watches', href: '/admin/products', icon: Watch },
    { label: 'Add Timepiece', href: '/admin/products/new', icon: PlusCircle },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Client Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-ultra text-luxury-500 font-semibold px-3 mb-2">
            Navigation
          </p>
          {links.map((link) => {
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
    <>
      {/* Mobile Toggle Button — shown in top bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 p-3 bg-gold text-luxury-950 rounded-full shadow-luxury-glow hover:bg-gold-hover transition-all"
        aria-label="Open admin navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-luxury-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-luxury-950 border-r border-luxury-800 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-luxury-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="mt-8 flex-1">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-64 bg-luxury-950 border-r border-luxury-800 p-6 flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
        <SidebarContent />
      </aside>
    </>
  );
};
