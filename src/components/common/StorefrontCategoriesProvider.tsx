'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ICategory } from '@/types';

const CategoriesContext = createContext<ICategory[]>([]);

export function useStorefrontCategories() {
  return useContext(CategoriesContext);
}

export function StorefrontCategoriesProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    let latest = 0;
    const refresh = async () => {
      const request = ++latest;
      try {
        const response = await fetch('/api/categories?active=true', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load categories');
        const result: ICategory[] = await response.json();
        if (!controller.signal.aborted && request === latest) {
          setCategories(result.filter(category => category.active).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch {
        if (!controller.signal.aborted && request === latest) setCategories([]);
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); window.removeEventListener('focus', refresh); };
  }, [pathname]);

  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
}
