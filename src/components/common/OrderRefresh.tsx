'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function OrderRefresh({ pending }: { pending: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!pending) return;
    let attempts = 0;
    const timer = setInterval(() => {
      router.refresh();
      if (++attempts >= 24) clearInterval(timer);
    }, 5000);
    return () => clearInterval(timer);
  }, [pending, router]);
  return <button type="button" onClick={() => router.refresh()} className="text-sm text-amber-700 dark:text-amber-400 underline">Refresh order status</button>;
}
