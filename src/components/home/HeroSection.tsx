import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { IHeroSettings } from "@/types";
export interface HeroSectionProps {
  settings?: IHeroSettings;
}
export const HeroSection = ({ settings }: HeroSectionProps) => (
  <section className="qt-hero">
    <div className="qt-hero-stage">
      <Image
        src={
          settings?.heroImage ||
          "https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=2000&auto=format&fit=crop"
        }
        alt={
          settings?.heroImageAlt || "A closer look at a distinctive timepiece"
        }
        fill
        priority
        sizes="100vw"
        unoptimized={settings?.heroImage?.startsWith("data:")}
      />
      <div className="qt-hero-content">
        <p className="qt-eyebrow">
          {settings?.badgeText || "The Quartz Times selection"}
        </p>
        <h1>
          {settings?.titleLine1 || "Find your"}
          <br />
          {settings?.titleHighlight || "everyday icon."}
        </h1>
        <p>
          {settings?.subtitle ||
            "Distinctive watches. Fresh footwear. Everyday essentials. Find the pieces that feel like you."}
        </p>
        <Link href="/products" className="qt-button">
          Explore the collection <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
    <div className="qt-hero-caption">
      <span>Watches. Shoes. T-shirts. Your next favourite.</span>
      {settings?.featuredWatchTitle ? (
        <Link
          href={settings.featuredWatchLink || "/products"}
          className="inline-flex items-center gap-2"
        >
          {settings.featuredWatchTitle} <ArrowUpRight size={15} />
        </Link>
      ) : (
        <Link
          href="/products?sort=newest"
          className="inline-flex items-center gap-2"
        >
          Discover what’s new <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  </section>
);
