"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);
  return (
    <div className="qt-container flex min-h-[60vh] flex-col items-center justify-center text-center py-20">
      <p className="qt-eyebrow qt-muted mb-6">Something went wrong</p>
      <h1 className="text-4xl font-semibold tracking-tighter">
        Let’s try that again.
      </h1>
      <p className="qt-muted text-sm leading-7 mt-5 mb-8 max-w-md">
        We couldn’t load this page. Try again, or head back to the collection.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={reset} className="qt-button">
          <RotateCcw size={17} /> Try again
        </button>
        <Link href="/products" className="qt-button qt-button-secondary">
          Browse products
        </Link>
      </div>
    </div>
  );
}
