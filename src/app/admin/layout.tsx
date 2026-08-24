import React from 'react';
import { getAdminSession } from '@/lib/auth';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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

  // If unauthenticated, children is rendered directly (which is the login page)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-luxury-950 text-luxury-100 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
