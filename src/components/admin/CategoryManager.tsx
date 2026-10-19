'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Edit2, Trash2, FolderTree, AlertCircle, Loader2, Upload, X, CheckCircle } from 'lucide-react';
import { ICategory } from '@/types';
import { slugify } from '@/lib/utils';
import { readImageDrop } from '@/lib/imageDrop';

export interface CategoryManagerProps {
  initialCategories: ICategory[];
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ initialCategories }) => {
  const [categories, setCategories] = useState<ICategory[]>(initialCategories);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [failedImage, setFailedImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadLock = useRef(false);
  const dragDepth = useRef(0);
  const busy = loading || uploading;

  const changeImage = (url: string) => {
    setImage(url);
    setFailedImage('');
    setUploadError('');
    setUploadMessage('');
  };

  const uploadCover = async (readSources: () => Promise<{ files: File[]; urls: string[] }>) => {
    if (busy || uploadLock.current) return;
    uploadLock.current = true;
    setUploading(true);
    setUploadError('');
    setUploadMessage('');

    try {
      const sources = await readSources();
      const entries = [...sources.files, ...sources.urls];
      if (entries.length !== 1) throw new Error('Choose or drop one image for the category cover.');

      const source = entries[0];
      let request: RequestInit;
      if (typeof source === 'string') {
        request = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: source }) };
      } else {
        if (source.size > 15 * 1024 * 1024) throw new Error('The cover image must be 15 MB or smaller.');
        const formData = new FormData();
        formData.append('file', source);
        formData.append('type', 'image');
        request = { method: 'POST', body: formData };
      }

      const response = await fetch('/api/upload', request);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(response.status === 401 ? 'Your admin session expired. Sign in again before uploading.' : data.error || 'Failed to upload the cover image.');
      }
      if (typeof data.url !== 'string' || !data.url) throw new Error('The upload did not return an image. Try again.');
      setImage(data.url);
      setFailedImage('');
      setUploadMessage('Cover image uploaded. Save the category to keep your changes.');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload the cover image.');
    } finally {
      uploadLock.current = false;
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    void uploadCover(() => readImageDrop(event.dataTransfer, window.location.origin));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy || uploadLock.current) return;

    setLoading(true);
    setError('');

    const payload = {
      name,
      slug: slugify(name),
      description,
      image: image.trim(),
      active: true,
    };

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save category');

      const saved = await res.json();
      if (editingId) {
        setCategories(categories.map((c) => ((c.id === editingId || c._id === editingId) ? saved : c)));
      } else {
        setCategories([...categories, saved]);
      }

      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: ICategory) => {
    if (busy || uploadLock.current) return;
    setError('');
    setEditingId(cat.id || cat._id || null);
    setName(cat.name);
    setDescription(cat.description || '');
    changeImage(cat.image || '');
  };

  const resetForm = () => {
    if (uploadLock.current) return;
    setEditingId(null);
    setName('');
    setDescription('');
    changeImage('');
  };

  const handleDelete = async (id: string, catName: string) => {
    if (busy || uploadLock.current) return;
    if (!confirm(`Delete category "${catName}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id && c._id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form column */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleSave}
          className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {editingId ? 'Edit Classification' : 'Add New Category'}
            </h3>
            {editingId && (
              <button
                type="button"
                disabled={busy}
                onClick={resetForm}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div role="alert" className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="category-name" className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
              Category Name *
            </label>
            <input
              id="category-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage & Rare Complications"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="category-description" className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium block">
              Description
            </label>
            <textarea
              id="category-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what products belong in this category."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium">
              Cover Image
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              disabled={busy}
              onChange={event => {
                const files = Array.from(event.target.files || []);
                if (files.length) void uploadCover(async () => ({ files, urls: [] }));
              }}
              className="hidden"
            />
            <button
              type="button"
              disabled={busy}
              aria-label="Upload cover image or drop an image here"
              aria-busy={uploading}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={event => { event.preventDefault(); if (!busy) { dragDepth.current++; setIsDragging(true); } }}
              onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = busy ? 'none' : 'copy'; }}
              onDragLeave={event => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setIsDragging(false); }}
              onDrop={handleDrop}
              className={`flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-wait disabled:opacity-60 ${isDragging ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'border-slate-300 bg-slate-50 hover:border-amber-500 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-amber-500'}`}
            >
              {uploading ? <Loader2 className="h-7 w-7 animate-spin text-amber-500" /> : <Upload className={`h-7 w-7 ${isDragging ? 'text-amber-500' : 'text-slate-400'}`} />}
              <span role="status" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {uploading ? 'Uploading cover image…' : isDragging ? 'Drop image to upload' : image ? 'Replace cover image' : 'Upload cover image'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Drag & drop from your computer or another browser tab, or click to browse.</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG, WebP, GIF, AVIF, HEIC · Up to 15 MB</span>
            </button>

            {uploadError && <p role="alert" className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{uploadError}</p>}
            {uploadMessage && <p role="status" className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400"><CheckCircle className="h-4 w-4 shrink-0" />{uploadMessage}</p>}

            {image && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-950">
                  {failedImage === image ? (
                    <p className="flex h-full items-center justify-center p-4 text-center text-xs text-slate-500 dark:text-slate-400">Image preview unavailable. Upload a new photo or check the image URL.</p>
                  ) : (
                    <Image key={image} src={image} alt={`${name || 'Category'} cover preview`} fill unoptimized draggable={false} className="object-cover" onError={() => setFailedImage(image)} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Cover preview</span>
                  <button type="button" disabled={busy} onClick={() => changeImage('')} className="inline-flex min-h-9 items-center gap-1.5 rounded px-2 text-xs text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/40">
                    <X className="h-4 w-4" />Remove image
                  </button>
                </div>
              </div>
            )}

            <details className="text-xs text-slate-500 dark:text-slate-400">
              <summary className="cursor-pointer rounded py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Or use an image URL</summary>
              <label htmlFor="category-cover-url" className="sr-only">Cover image URL</label>
              <input
                id="category-cover-url"
                type="url"
                inputMode="url"
                value={image}
                disabled={busy}
                onChange={event => changeImage(event.target.value)}
                placeholder="https://..."
                className="mt-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none disabled:opacity-50"
              />
            </details>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? 'Uploading image…' : loading ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </span>
          </button>
        </form>
      </div>

      {/* List column */}
      <div className="lg:col-span-7 space-y-4">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {categories.map((cat) => {
                const id = cat.id || cat._id || '';
                return (
                  <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{cat.name}</p>
                        {cat.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-600 dark:text-amber-400 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={busy}
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(id, cat.name)}
                          disabled={busy || deletingId === id}
                          className="p-1.5 rounded text-rose-400 hover:text-rose-300 disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
