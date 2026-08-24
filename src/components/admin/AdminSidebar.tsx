'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Watch,
  FolderTree,
  MessageSquare,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'All Watches', href: '/admin/products', icon: Watch },
    { label: 'Add Timepiece', href: '/admin/products/new', icon: PlusCircle },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Client Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-luxury-950 border-r border-luxury-800 p-6 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
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
                <Icon className="w-4 h-4" />
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
    </aside>
  );
};
