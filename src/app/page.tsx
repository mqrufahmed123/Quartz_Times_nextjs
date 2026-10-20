import React from "react";
import { getFeaturedProducts, getNewArrivals } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { getHeroSettings } from "@/services/heroSettingsService";
import { HeroSection } from "@/components/home/HeroSection";
import { CuratedCollection } from "@/components/home/CuratedCollection";
import { CategoryBento } from "@/components/home/CategoryBento";
import { BrandStory } from "@/components/home/BrandStory";
import { CraftsmanshipSection } from "@/components/home/CraftsmanshipSection";
import { WhatsAppBanner } from "@/components/home/WhatsAppBanner";

export const revalidate = 60; // ISR revalidation

export default async function HomePage() {
  const [featuredProducts, categories, newArrivals, heroSettings] =
    await Promise.all([
      getFeaturedProducts(6),
      getCategories(true),
      getNewArrivals(6),
      getHeroSettings(),
    ]);

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection settings={heroSettings} />

      {/* 2. Featured Products */}
      <CuratedCollection
        products={featuredProducts}
        title="Selected for you"
        subtitle="Good pieces. Worth a closer look."
      />

      {/* 3. Shop by Category */}
      <CategoryBento categories={categories} />

      {/* 4. New Arrivals */}
      {newArrivals.length > 0 && (
        <CuratedCollection
          products={newArrivals}
          title="New arrivals"
          subtitle="Fresh finds, just added."
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
