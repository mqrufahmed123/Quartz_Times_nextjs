'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { IProduct, ICategory } from '@/types';
import { MediaUploader } from './MediaUploader';
import { slugify } from '@/lib/utils';

export interface ProductFormProps {
  initialData?: Partial<IProduct>;
  categories: ICategory[];
  isEdit?: boolean;
  onSaved?: (product: IProduct) => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  formId?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  isEdit = false,
  onSaved,
  onCancel,
  onBusyChange,
  onDirtyChange,
  formId,
}) => {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [story, setStory] = useState(initialData?.story || '');
  const [price, setPrice] = useState<number | string>(initialData?.price ?? '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(initialData?.originalPrice ?? '');
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [stock, setStock] = useState<number | string>(initialData?.stock ?? 1);
  const [availability, setAvailability] = useState<IProduct['availability']>(initialData?.availability || 'in_stock');
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(initialData?.isNewArrival || false);
  const [status, setStatus] = useState<IProduct['status']>(initialData?.status || 'active');

  // Specifications
  const [movement, setMovement] = useState(initialData?.specifications?.movement ?? (isEdit ? '' : 'Quartz'));
  const [caseMaterial, setCaseMaterial] = useState(initialData?.specifications?.caseMaterial ?? (isEdit ? '' : '316L Stainless Steel'));
  const [strapMaterial, setStrapMaterial] = useState(initialData?.specifications?.strapMaterial || '');
  const [dialColor, setDialColor] = useState(initialData?.specifications?.dialColor || '');
  const [waterResistance, setWaterResistance] = useState(initialData?.specifications?.waterResistance || '');
  const [caseDiameter, setCaseDiameter] = useState(initialData?.specifications?.caseDiameter ?? (isEdit ? '' : '40 mm'));
  const [crystal, setCrystal] = useState(initialData?.specifications?.crystal ?? (isEdit ? '' : 'Scratch-Resistant Sapphire'));
  const [powerReserve, setPowerReserve] = useState(initialData?.specifications?.powerReserve || '');
  const [warranty, setWarranty] = useState(initialData?.specifications?.warranty || '');
  const [referenceNumber, setReferenceNumber] = useState(initialData?.specifications?.referenceNumber || '');
  const [condition, setCondition] = useState(initialData?.specifications?.condition ?? (isEdit ? '' : 'New'));

  // Media
  const [images, setImages] = useState(initialData?.images || []);
  const [video, setVideo] = useState(initialData?.video);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const Heading = onSaved ? 'h2' : 'h1';

  useEffect(() => { onBusyChange?.(loading || mediaUploading); }, [loading, mediaUploading, onBusyChange]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || mediaUploading) return;
    if (!name.trim() || !brand.trim() || !description.trim() || !price || !sku.trim()) {
      setError('Please provide the watch name, brand, description, SKU, and price.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    const payload = {
      name,
      slug: slug || slugify(name),
      brand,
      category,
      description,
      story,
      price: Number(price),
      originalPrice: originalPrice === '' ? null : Number(originalPrice),
      currency: currency.toUpperCase().trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      sku: sku.toUpperCase().trim(),
      stock: Number(stock),
      availability,
      featured,
      isNewArrival,
      status,
      specifications: {
        movement,
        caseMaterial,
        strapMaterial,
        dialColor,
        waterResistance,
        caseDiameter,
        crystal,
        powerReserve,
        warranty,
        referenceNumber,
        condition,
      },
      images,
      video: video || null,
    };

    try {
      const url = isEdit
        ? `/api/products/${initialData?.id || initialData?._id}`
        : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(res.status === 401 ? 'Your admin session expired. Sign in again before saving.' : errData.error || 'Failed to save watch.');
      }

      setSuccess(true);
      const savedProduct = await res.json();
      if (onSaved) { onSaved(savedProduct); return; }
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving watch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} onChangeCapture={() => onDirtyChange?.(true)} className="space-y-6 sm:space-y-10 max-w-5xl">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          {onCancel ? <button type="button" onClick={onCancel} disabled={loading || mediaUploading} aria-label="Cancel product changes" className="rounded-lg border border-slate-200 p-2 dark:border-slate-800"><ArrowLeft className="h-4 w-4" /></button> : <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>}
          <div>
            <Heading className="font-serif text-2xl text-slate-900 dark:text-slate-100 font-semibold break-words">
              {isEdit ? `Edit ${name}` : 'Add Watch'}
            </Heading>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
              Add product details, pricing, photos, and stock
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || mediaUploading}
          className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-md transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{loading ? 'Saving...' : isEdit ? 'Update Watch' : 'Save Watch'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2" role="status">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{onSaved ? 'Product changes saved.' : 'Watch saved. Returning to the product list...'}</span>
        </div>
      )}

      {/* SECTION 1: MEDIA UPLOADER */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="font-serif text-base text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
          1. Photos and Video
        </h2>
        <MediaUploader
          disabled={loading}
          images={images}
          video={video}
          onChangeImages={value => { setImages(value); onDirtyChange?.(true); }}
          onChangeVideo={value => { setVideo(value); onDirtyChange?.(true); }}
          onUploadingChange={setMediaUploading}
        />
      </div>

      {/* SECTION 2: CORE DETAILS */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="font-serif text-base text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
          2. Product Details and Pricing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Watch Name *
            </label>
            <input
              type="text"
              required
              aria-label="Watch name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Classic Black Dial Watch"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Brand *
            </label>
            <input
              type="text"
              required
              aria-label="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Casio, Titan, Fossil"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              URL Slug *
            </label>
            <input
              type="text"
              required
              aria-label="URL slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(Boolean(e.target.value));
              }}
              placeholder="classic-black-dial-watch"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Category
            </label>
            <select
              required
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="" disabled>Select a category</option>
              {category && !categories.some(item => item.name === category) && <option value={category}>{category} (current; no longer listed)</option>}
              {categories.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}{!c.active ? ' (inactive)' : ''}
                </option>
              ))}
            </select>
            {!categories.length && <p className="text-xs text-amber-700 dark:text-amber-400">Add a category in Admin → Categories before assigning a new category.</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              SKU *
            </label>
            <input
              type="text"
              required
              aria-label="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. QT-BLK-001"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono uppercase focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Selling Price *
            </label>
            <input
              type="number"
              required
              aria-label="Selling price"
              value={price}
              min="0.01"
              step="0.01"
              onChange={(e) => setPrice(e.target.value)}
              placeholder="4999"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Original Price (Optional)
            </label>
            <input
              type="number"
              aria-label="Original price"
              value={originalPrice}
              min="0"
              step="0.01"
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="5999"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Availability
            </label>
            <select
              aria-label="Availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="in_stock">In Stock</option>
              <option value="reserved">Reserved</option>
              <option value="sold_out">Out of Stock</option>
              <option value="made_to_order">Pre-Order</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="product-stock" className="block text-xs font-medium uppercase tracking-widest text-slate-600 dark:text-slate-300">Stock quantity</label>
            <input id="product-stock" type="number" required min="0" step="1" value={stock} onChange={e => setStock(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="product-currency" className="block text-xs font-medium uppercase tracking-widest text-slate-600 dark:text-slate-300">Currency</label>
            <input id="product-currency" type="text" required pattern="[A-Z]{3}" maxLength={3} value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
            Description *
          </label>
          <textarea
            rows={4}
            required
            aria-label="Description"
              value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the watch, its style, materials, and key features."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
            Additional Information (Optional)
          </label>
          <textarea
            rows={2}
            aria-label="Additional information"
              value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Add package contents, care instructions, or other useful details."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-1.5">
          <label htmlFor="product-tags" className="block text-xs font-medium uppercase tracking-widest text-slate-600 dark:text-slate-300">Tags (comma separated)</label>
          <input id="product-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Dress, steel, everyday" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950" />
        </div>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 focus:ring-amber-500"
            />
            <span>Feature on Homepage</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="rounded bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 focus:ring-amber-500"
            />
            <span>Mark as New Arrival</span>
          </label>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span>Publish Status:</span>
            <select
              aria-label="Publish status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="active">Active (Visible)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: TECHNICAL HOROLOGY SPECS */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="font-serif text-base text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
          3. Watch Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Movement Type
            </label>
            <input
              type="text"
              aria-label="Movement type"
              value={movement}
              onChange={(e) => setMovement(e.target.value)}
              placeholder="e.g. Quartz or Automatic"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Case Material
            </label>
            <input
              type="text"
              aria-label="Case material"
              value={caseMaterial}
              onChange={(e) => setCaseMaterial(e.target.value)}
              placeholder="e.g. 316L Steel / 18K Rose Gold"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Case Diameter
            </label>
            <input
              type="text"
              aria-label="Case diameter"
              value={caseDiameter}
              onChange={(e) => setCaseDiameter(e.target.value)}
              placeholder="e.g. 39 mm / 40 mm"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Dial Color
            </label>
            <input
              type="text"
              aria-label="Dial color"
              value={dialColor}
              onChange={(e) => setDialColor(e.target.value)}
              placeholder="e.g. Black"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Strap / Bracelet
            </label>
            <input
              type="text"
              aria-label="Strap or bracelet"
              value={strapMaterial}
              onChange={(e) => setStrapMaterial(e.target.value)}
              placeholder="e.g. Stainless steel, leather, or silicone"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Water Resistance
            </label>
            <input
              type="text"
              aria-label="Water resistance"
              value={waterResistance}
              onChange={(e) => setWaterResistance(e.target.value)}
              placeholder="e.g. 50m / 5 ATM / 300m Diver"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Crystal / Glass
            </label>
            <input
              type="text"
              aria-label="Crystal or glass"
              value={crystal}
              onChange={(e) => setCrystal(e.target.value)}
              placeholder="e.g. Scratch-Resistant Sapphire"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Power Reserve
            </label>
            <input
              type="text"
              aria-label="Power reserve"
              value={powerReserve}
              onChange={(e) => setPowerReserve(e.target.value)}
              placeholder="e.g. 70 Hours"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Model / Reference Number
            </label>
            <input
              type="text"
              aria-label="Model or reference number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. MTP-VD01D-1EV"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Condition
            </label>
            <input
              type="text"
              aria-label="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. New"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 font-medium block">
              Warranty
            </label>
            <input
              type="text"
              aria-label="Warranty"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="e.g. 1-year seller warranty"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading || mediaUploading}
          className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Watch'}</span>
        </button>
      </div>
    </form>
  );
};
