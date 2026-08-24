'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@quartztimes.com');
  const [password, setPassword] = useState('QuartzLuxury2025!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid atelier credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-950 flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-luxury-900/80 border border-luxury-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/40 text-gold flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-luxury-100">
            QUARTZ TIMES
          </h1>
          <p className="text-xs uppercase tracking-widest text-gold/80">
            Horological Atelier Director Portal
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
              Director Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-luxury-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@quartztimes.com"
                className="w-full bg-luxury-950 border border-luxury-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-luxury-100 placeholder-luxury-600 focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
              Vault Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-luxury-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-luxury-950 border border-luxury-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-luxury-100 placeholder-luxury-600 focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-hover text-luxury-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>Authenticate Session</span>
          </button>
        </form>

        <div className="pt-4 border-t border-luxury-800 text-center">
          <Link
            href="/"
            className="text-xs text-luxury-400 hover:text-gold transition-colors"
          >
            ← Return to Public Boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
