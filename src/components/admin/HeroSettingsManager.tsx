'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { IHeroSettings } from '@/types';

export interface HeroSettingsManagerProps {
  initialSettings: IHeroSettings;
}

export const HeroSettingsManager: React.FC<HeroSettingsManagerProps> = ({
  initialSettings,
}) => {
  const [settings, setSettings] = useState<IHeroSettings>(initialSettings);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await res.json();
      setSettings((prev) => ({
        ...prev,
        heroImage: data.url,
      }));
      setStatusMessage({
        type: 'success',
        text: 'Image uploaded successfully. Remember to click "Save Settings" below.',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Image upload failed',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save settings');
      }

      const updated = await res.json();
      setSettings(updated);
      setStatusMessage({
        type: 'success',
        text: 'Hero banner updated! Homepage has been refreshed with your changes.',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error updating hero settings',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <p>{statusMessage.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Hero Image Upload Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Hero Photo & Media
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a high-resolution watch photo (Cloudinary-optimized) or specify an image URL.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleImageUpload}
                className="hidden"
                id="hero-file-upload"
              />

              <label
                htmlFor="hero-file-upload"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  uploading
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md active:scale-95'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Photo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload New Photo</span>
                  </>
                )}
              </label>

              <span className="text-xs text-slate-400 self-center hidden sm:inline">or</span>

              <div className="w-full sm:flex-1 space-y-1">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or Cloudinary URL"
                  value={settings.heroImage}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, heroImage: e.target.value }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                Image Alt Description
              </label>
              <input
                type="text"
                value={settings.heroImageAlt || ''}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, heroImageAlt: e.target.value }))
                }
                placeholder="e.g. Audemars Piguet Royal Oak photographed on black velvet"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Hero Typography & Copy */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Headlines & Text
            </h3>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                Badge / Tag Text
              </label>
              <input
                type="text"
                value={settings.badgeText || ''}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, badgeText: e.target.value }))
                }
                placeholder="e.g. Authentic Watch Boutique"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                  Title Line 1
                </label>
                <input
                  type="text"
                  value={settings.titleLine1 || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, titleLine1: e.target.value }))
                  }
                  placeholder="e.g. TIMECRAFTED"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                  Title Highlight (Gold)
                </label>
                <input
                  type="text"
                  value={settings.titleHighlight || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, titleHighlight: e.target.value }))
                  }
                  placeholder="e.g. PRECISION"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-amber-600 dark:text-amber-400 focus:border-amber-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                Subtitle Paragraph
              </label>
              <textarea
                rows={3}
                value={settings.subtitle || ''}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Brief brand introduction displayed beneath the headline."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Featured Watch Floating Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Featured Watch Badge Overlay
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                  Watch Model Name
                </label>
                <input
                  type="text"
                  value={settings.featuredWatchTitle || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      featuredWatchTitle: e.target.value,
                    }))
                  }
                  placeholder="e.g. Royal Oak Selfwinding"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={settings.featuredWatchRef || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      featuredWatchRef: e.target.value,
                    }))
                  }
                  placeholder="e.g. Ref. 15202ST"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
                Product Link URL
              </label>
              <input
                type="text"
                value={settings.featuredWatchLink || ''}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    featuredWatchLink: e.target.value,
                  }))
                }
                placeholder="e.g. /watches/royal-oak-selfwinding-jumbo-ultra-thin"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider py-4 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Saving Settings...' : 'Save & Publish Hero Changes'}
            </span>
          </button>
        </div>

        {/* Right: Live Preview Stage */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Live Homepage Preview
            </h4>
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group">
              {settings.heroImage ? (
                <Image
                  src={settings.heroImage}
                  alt={settings.heroImageAlt || 'Hero Watch Preview'}
                  fill
                  className="object-cover object-center"
                  sizes="400px"
                  unoptimized={settings.heroImage.startsWith('data:')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                  No Image Selected
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

              {/* Floating Featured Watch Card Preview */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg space-y-1.5 text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  <span>Featured Watch</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {settings.featuredWatchRef || 'Ref. 15202ST'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {settings.featuredWatchTitle || 'Royal Oak Selfwinding'}
                  </h3>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold shrink-0">
                    View
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="absolute -top-2 -right-2 flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-emerald-400/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full shadow-md text-[10px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Inspected</span>
              </div>
            </div>

            {/* Headline preview snippet */}
            <div className="mt-4 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold block">
                {settings.badgeText || 'Authentic Watch Boutique'}
              </span>
              <p className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                {settings.titleLine1 || 'TIMECRAFTED'}{' '}
                <span className="text-amber-600 dark:text-amber-400">
                  {settings.titleHighlight || 'PRECISION'}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {settings.subtitle}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
