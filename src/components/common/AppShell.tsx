"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloatingButton } from "./WhatsAppButton";
import { StorefrontAdminProvider } from "@/components/admin/StorefrontAdminProvider";
import { StorefrontCategoriesProvider } from "./StorefrontCategoriesProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <StorefrontAdminProvider>
      <StorefrontCategoriesProvider>
        <div className="storefront flex min-h-screen w-full flex-col">
          <a href="#main-content" className="qt-skip-link">
            Skip to content
          </a>
          <Suspense fallback={<div className="h-20" />}>
            <Navbar />
          </Suspense>
          <AnnouncementBar />
          <main id="main-content" className="min-w-0 flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <WhatsAppFloatingButton />
        </div>
      </StorefrontCategoriesProvider>
    </StorefrontAdminProvider>
  );
}
