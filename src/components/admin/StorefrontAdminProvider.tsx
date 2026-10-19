'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AdminContext = createContext({
  isAdmin: false,
  notify: (_message: string) => {},
});

export function useStorefrontAdmin() {
  return useContext(AdminContext);
}

export function StorefrontAdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const notify = useCallback((text: string) => setMessage(text), []);

  useEffect(() => {
    const controller = new AbortController();
    let check = 0;
    const refreshSession = async () => {
      const current = ++check;
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal });
        const data = response.ok ? await response.json() : null;
        if (current === check) setIsAdmin(Boolean(data?.authenticated && ['admin', 'superadmin'].includes(data.user?.role)));
      } catch {
        if (!controller.signal.aborted && current === check) setIsAdmin(false);
      }
    };
    void refreshSession();
    window.addEventListener('focus', refreshSession);
    return () => { controller.abort(); window.removeEventListener('focus', refreshSession); };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <AdminContext.Provider value={{ isAdmin, notify }}>
      {children}
      {message && <div role="status" className="fixed bottom-4 left-4 right-4 z-[80] rounded-xl border border-emerald-400 bg-white px-5 py-4 text-sm text-emerald-800 shadow-xl dark:bg-slate-900 dark:text-emerald-300 sm:left-auto sm:max-w-sm">{message}</div>}
    </AdminContext.Provider>
  );
}
