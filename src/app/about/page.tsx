import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { CraftsmanshipSection } from "@/components/home/CraftsmanshipSection";
import { WhatsAppBanner } from "@/components/home/WhatsAppBanner";
export const metadata: Metadata = {
  title: "Our story",
  description:
    "Meet Quartz Times. Discover our approach to watches, footwear, everyday style, and personal service.",
};
export default function AboutPage() {
  return (
    <>
      <div className="qt-container">
        <header className="qt-page-heading">
          <p className="qt-eyebrow">This is Quartz Times</p>
          <h1>
            Good style.
            <br />A personal connection.
          </h1>
          <p>
            Watches, shoes and T-shirts, brought together by an appreciation for
            the details. A collection to explore at your own pace, with people
            ready to help.
          </p>
        </header>
      </div>
      <section className="qt-container pb-16">
        <div className="qt-editorial">
          <div className="qt-editorial-photo">
            <Image
              src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
              alt="A watch photographed up close, showing its dial and finishing"
              fill
              priority
              sizes="(max-width: 639px) 100vw, 50vw"
            />
          </div>
          <div className="qt-editorial-copy">
            <p className="qt-eyebrow">Our approach</p>
            <h2>
              Choose well.
              <br />
              Make it yours.
            </h2>
            <p>
              We believe finding something you love should feel straightforward.
              Clear product information, transparent prices and thoughtful
              options make it easier to find your next favourite.
            </p>
            <p className="mt-5">
              Want to see more? Ask for a close-up, a video or help with sizing.
              We keep the conversation personal, from your first question to
              delivery details.
            </p>
            <Link href="/products" className="qt-button mt-8">
              Explore the collection <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <CraftsmanshipSection />
      <WhatsAppBanner />
    </>
  );
}
