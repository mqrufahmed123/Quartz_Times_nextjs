'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppFloatingButton } from './WhatsAppButton';
import { StorefrontAdminProvider } from '@/components/admin/StorefrontAdminProvider';
import { StorefrontCategoriesProvider } from './StorefrontCategoriesProvider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <StorefrontAdminProvider>
      <StorefrontCategoriesProvider>
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloatingButton />
      </StorefrontCategoriesProvider>
    </StorefrontAdminProvider>
  );
}
