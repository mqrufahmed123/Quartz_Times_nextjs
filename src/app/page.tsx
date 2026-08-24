import React from 'react';
import { getFeaturedProducts, getNewArrivals } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { HeroSection } from '@/components/home/HeroSection';
import { CuratedCollection } from '@/components/home/CuratedCollection';
import { CategoryBento } from '@/components/home/CategoryBento';
import { BrandStory } from '@/components/home/BrandStory';
import { CraftsmanshipSection } from '@/components/home/CraftsmanshipSection';
import { WhatsAppBanner } from '@/components/home/WhatsAppBanner';

export const revalidate = 60; // ISR revalidation

export default async function HomePage() {
  const [featuredProducts, categories, newArrivals] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(true),
    getNewArrivals(6),
  ]);

  return (
    <div className="space-y-0">
      {/* 1. Photography-First Editorial Hero */}
      <HeroSection />

      {/* 2. Curated Private Vault (Featured Watches) */}
      <CuratedCollection
        products={featuredProducts}
        title="Curated Private Vault"
        subtitle="Masterpieces inspected by certified horologists, available for immediate acquisition"
      />

      {/* 3. Complication & Classification Bento Discovery */}
      <CategoryBento categories={categories} />

      {/* 4. New Horological Additions */}
      {newArrivals.length > 0 && (
        <CuratedCollection
          products={newArrivals}
          title="Recent Additions"
          subtitle="The latest horological acquisitions to enter the Quartz Times atelier"
        />
      )}

      {/* 5. Brand Story & Horological Ethos */}
      <BrandStory />

      {/* 6. The 32-Point Master Inspection & Craftsmanship */}
      <CraftsmanshipSection />

      {/* 7. WhatsApp Concierge Direct Conversion Banner */}
      <WhatsAppBanner />
    </div>
  );
}
