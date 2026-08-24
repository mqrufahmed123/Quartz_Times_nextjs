'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, LogOut, Shield } from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <header className="bg-luxury-950 border-b border-luxury-800 py-3.5 px-6 sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gold" />
          <span className="font-serif text-lg font-bold tracking-wider text-luxury-100">
            QUARTZ TIMES
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gold bg-gold/15 px-2 py-0.5 rounded border border-gold/30">
            Atelier Management
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="text-xs uppercase tracking-wider text-luxury-300 hover:text-gold transition-colors flex items-center gap-1.5"
        >
          <span>View Boutique</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="text-xs uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/60 px-3 py-1.5 rounded"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
