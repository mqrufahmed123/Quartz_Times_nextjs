import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { AppShell } from '@/components/common/AppShell';
import { NavigationProgress } from '@/components/common/NavigationProgress';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Quartz Times | Premium & Luxury Watches',
    template: '%s | Quartz Times',
  },
  description:
    'Quartz Times is a luxury watch boutique offering 100% authentic Swiss & Japanese watches with insured nationwide shipping and instant WhatsApp support.',
  keywords: [
    'luxury watches',
    'Rolex',
    'Omega',
    'Audemars Piguet',
    'Patek Philippe',
    'Grand Seiko',
    'Cartier',
    'authentic watches',
    'buy watches online',
  ],
  authors: [{ name: 'Quartz Times' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Quartz Times | Premium & Luxury Watches',
    description:
      'Shop 100% authentic luxury timepieces with insured delivery and direct WhatsApp assistance.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Quartz Times',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-[#F0EFF4] min-h-screen flex flex-col antialiased transition-colors duration-200">
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
