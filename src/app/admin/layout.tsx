import React from 'react';
import { getAdminSession } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Director Portal | Quartz Times Atelier',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Unauthenticated: render login page directly (no shell)
  if (!session) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
