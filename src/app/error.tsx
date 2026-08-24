'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-luxury-950 px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-ultra text-rose-400 font-semibold">
            System Synchronization Interrupted
          </span>
          <h1 className="font-serif text-3xl text-luxury-100 font-normal">
            Horological Vault Error
          </h1>
          <p className="text-xs text-luxury-400 font-light leading-relaxed">
            We encountered a temporary synchronization glitch. You may retry reloading the vault or navigate back to the main collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-luxury-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Vault</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-luxury-900 hover:bg-luxury-800 text-luxury-200 border border-luxury-800 text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
