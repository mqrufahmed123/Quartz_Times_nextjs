'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Pencil, Save, X } from 'lucide-react';
import { ICategory, IProduct } from '@/types';
import { useStorefrontAdmin } from './StorefrontAdminProvider';

const ProductForm = dynamic(() => import('./ProductForm').then(module => module.ProductForm), {
  loading: () => <p className="p-6 text-sm text-slate-500">Loading product form…</p>,
});

export function StorefrontProductEditor({ product, compact = false }: { product: IProduct; compact?: boolean }) {
  const { isAdmin, notify } = useStorefrontAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [data, setData] = useState<{ product: IProduct; categories: ICategory[] } | null>(null);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const formId = `${titleId}-form`;
  const id = product.id || product._id;

  useEffect(() => {
    if (!open || !isAdmin) return;
    const controller = new AbortController();
    setData(null);
    setError('');
    setDirty(false);
    setConfirmDiscard(false);
    fetch(`/api/admin/products/${id}/editor`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(response.status === 401 ? 'Your admin session expired. Sign in again to edit this watch.' : result.error);
        setData(result);
      })
      .catch(error => { if (!controller.signal.aborted) setError(error.message || 'Unable to load product.'); });
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => {
      controller.abort();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, isAdmin, id]);

  const close = () => {
    if (busy) return;
    if (dirty) { setConfirmDiscard(true); return; }
    setOpen(false);
  };

  const saved = (updated: IProduct) => {
    setOpen(false);
    setDirty(false);
    notify(updated.status === 'active' ? 'Product changes saved.' : 'Product saved and hidden from the public catalogue.');
    if (pathname === `/watches/${product.slug}`) {
      if (updated.status !== 'active') router.replace('/watches');
      else if (updated.slug !== product.slug) router.replace(`/watches/${encodeURIComponent(updated.slug)}`);
    }
    router.refresh();
  };

  if (!isAdmin || !id) return null;

  return <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Edit ${product.name}`}
      className={compact
        ? 'flex min-h-9 w-full items-center justify-center gap-1.5 border-t border-amber-300 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
        : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'}
    ><Pencil className="h-4 w-4" />Edit product</button>

    {open && createPortal(
      <div className="fixed inset-0 z-[70] bg-black/65 p-0 backdrop-blur-sm sm:p-5">
        <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId}
          onKeyDown={event => {
            if (event.key === 'Escape') { event.preventDefault(); close(); }
            if (event.key !== 'Tab') return;
            const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href]') || []).filter(element => element.getClientRects().length);
            const first = controls[0]; const last = controls[controls.length - 1];
            if (!first) return;
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }}
          className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden bg-slate-50 text-slate-900 shadow-2xl outline-none dark:bg-[#0A0A0B] dark:text-slate-100 sm:rounded-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
            <div><h2 id={titleId} className="font-serif text-xl font-semibold">Edit product</h2><p className="text-xs text-slate-500 dark:text-slate-400">Admin only · Changes appear on the website after saving</p></div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="submit" form={formId} disabled={busy || !data} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-600 disabled:opacity-50"><Save className="h-4 w-4" />{busy ? 'Please wait…' : 'Save'}</button>
              <button type="button" disabled={busy} aria-label="Close product editor" onClick={close} className="rounded-lg p-3 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
          </div>
          {confirmDiscard && <div role="alert" className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200 sm:px-6">
            <p>Discard your unsaved product changes?</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-lg border border-amber-400 px-3 py-2 font-semibold">Keep editing</button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-amber-600 px-3 py-2 font-semibold text-white">Discard changes</button>
            </div>
          </div>}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6">
            {error ? <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>
              : data ? <ProductForm formId={formId} initialData={data.product} categories={data.categories} isEdit onSaved={saved} onCancel={close} onBusyChange={setBusy} onDirtyChange={setDirty} />
                : <p role="status" className="flex items-center gap-2 p-6 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading product…</p>}
          </div>
        </div>
      </div>, document.body)}
  </>;
}
