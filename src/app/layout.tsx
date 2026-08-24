import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { WhatsAppFloatingButton } from '@/components/common/WhatsAppButton';

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
    default: 'Quartz Times | Haute Horology & Fine Timepieces',
    template: '%s | Quartz Times Horology',
  },
  description:
    'Quartz Times is an independent luxury watch boutique specializing in certified authentic Swiss and Japanese timepieces. Curated acquisitions with direct WhatsApp concierge.',
  keywords: [
    'luxury watches',
    'Audemars Piguet',
    'Rolex',
    'Patek Philippe',
    'Omega',
    'Grand Seiko',
    'Cartier',
    'fine timepieces India',
    'authentic watch boutique',
    'haute horology',
  ],
  authors: [{ name: 'Quartz Times Horology' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Quartz Times | Haute Horology & Fine Timepieces',
    description:
      'Curated fine timepieces for collectors who appreciate micro-mechanical mastery. Certified authentic with direct concierge.',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark scroll-smooth`}>
      <body className="bg-luxury-950 text-luxury-100 min-h-screen flex flex-col antialiased">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
