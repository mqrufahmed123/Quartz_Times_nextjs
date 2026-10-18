'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

export const SignOutButton: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/user-logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out. Please retry.');
      router.push('/login');
      router.refresh();
    } catch (e) {
      setError('Could not sign out. Please retry.');
      setLoading(false);
    }
  };

  return (
    <div>
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
      <span>Sign Out</span>
    </button>
    </div>
  );
};
