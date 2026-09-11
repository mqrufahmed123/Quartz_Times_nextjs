import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getHeroSettings } from '@/services/heroSettingsService';
import { HeroSettingsManager } from '@/components/admin/HeroSettingsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHeroPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const settings = await getHeroSettings();

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="text-[10px] uppercase tracking-ultra text-amber-600 dark:text-amber-400 font-semibold block">
          Homepage Configuration
        </span>
        <h1 className="font-serif text-3xl text-slate-900 dark:text-slate-100 font-normal">
          Hero Banner & Media
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload and manage the spotlight watch photograph, headlines, and call-to-actions displayed on the boutique homepage.
        </p>
      </div>

      <HeroSettingsManager initialSettings={settings} />
    </div>
  );
}
