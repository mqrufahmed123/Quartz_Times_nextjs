import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="qt-container flex min-h-[60vh] flex-col items-center justify-center text-center py-20">
      <p className="qt-eyebrow qt-muted mb-6">404 · Page not found</p>
      <h1 className="text-4xl sm:text-6xl font-semibold tracking-tighter">
        This one’s out of reach.
      </h1>
      <p className="qt-muted text-sm leading-7 mt-5 mb-8 max-w-md">
        This page may have moved, or the product is no longer listed. There’s
        more to discover in the collection.
      </p>
      <Link href="/products" className="qt-button">
        <ArrowLeft size={17} /> Explore the collection
      </Link>
    </div>
  );
}
