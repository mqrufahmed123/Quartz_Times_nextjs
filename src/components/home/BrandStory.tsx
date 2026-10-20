import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export const BrandStory = () => (
  <section className="qt-section">
    <div className="qt-container">
      <div className="qt-editorial">
        <div className="qt-editorial-photo">
          <Image
            src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
            alt="The materials and details of a carefully chosen watch"
            fill
            sizes="(max-width: 639px) 100vw, 50vw"
          />
        </div>
        <div className="qt-editorial-copy">
          <p className="qt-eyebrow">Less noise. Better finds.</p>
          <h2>
            It’s all
            <br />
            in the details.
          </h2>
          <p>
            A great find starts with a closer look. Discover our collection with
            clear specifications, considered details, and a real person to help
            you choose.
          </p>
          <Link href="/about" className="qt-button mt-8">
            Meet Quartz Times <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);
