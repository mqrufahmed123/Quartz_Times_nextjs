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
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Watches */}
      <CuratedCollection
        products={featuredProducts}
        title="Featured Watches"
        subtitle="Handpicked luxury and automatic timepieces in stock for fast delivery"
      />

      {/* 3. Shop by Category */}
      <CategoryBento categories={categories} />

      {/* 4. New Arrivals */}
      {newArrivals.length > 0 && (
        <CuratedCollection
          products={newArrivals}
          title="New Arrivals"
          subtitle="Explore the latest additions to our watch collection"
        />
      )}

      {/* 5. About Us */}
      <BrandStory />

      {/* 6. 4-Step Quality Inspection */}
      <CraftsmanshipSection />

      {/* 7. WhatsApp Customer Support */}
      <WhatsAppBanner />
    </div>
  );
}
