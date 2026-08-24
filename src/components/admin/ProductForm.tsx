'use client';

import React, { useState } from 'react';
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
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  isEdit = false,
}) => {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [brand, setBrand] = useState(initialData?.brand || 'Rolex');
  const [category, setCategory] = useState(initialData?.category || (categories[0]?.name || 'Automatic'));
  const [description, setDescription] = useState(initialData?.description || '');
  const [story, setStory] = useState(initialData?.story || '');
  const [price, setPrice] = useState<number | string>(initialData?.price || '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(initialData?.originalPrice || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [stock, setStock] = useState<number | string>(initialData?.stock ?? 1);
  const [availability, setAvailability] = useState<IProduct['availability']>(initialData?.availability || 'in_stock');
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(initialData?.isNewArrival || false);
  const [status, setStatus] = useState<IProduct['status']>(initialData?.status || 'active');

  // Specifications
  const [movement, setMovement] = useState(initialData?.specifications?.movement || 'Automatic Calibre');
  const [caseMaterial, setCaseMaterial] = useState(initialData?.specifications?.caseMaterial || '316L Stainless Steel');
  const [strapMaterial, setStrapMaterial] = useState(initialData?.specifications?.strapMaterial || 'Oystersteel Bracelet');
  const [dialColor, setDialColor] = useState(initialData?.specifications?.dialColor || 'Black Lacquer');
  const [waterResistance, setWaterResistance] = useState(initialData?.specifications?.waterResistance || '100m / 10 ATM');
  const [caseDiameter, setCaseDiameter] = useState(initialData?.specifications?.caseDiameter || '40 mm');
  const [crystal, setCrystal] = useState(initialData?.specifications?.crystal || 'Scratch-Resistant Sapphire');
  const [powerReserve, setPowerReserve] = useState(initialData?.specifications?.powerReserve || '70 Hours');
  const [warranty, setWarranty] = useState(initialData?.specifications?.warranty || '2 Years Quartz Times Certified Guarantee');
  const [referenceNumber, setReferenceNumber] = useState(initialData?.specifications?.referenceNumber || '');
  const [condition, setCondition] = useState(initialData?.specifications?.condition || 'Mint / Collector Grade');

  // Media
  const [images, setImages] = useState(initialData?.images || []);
  const [video, setVideo] = useState(initialData?.video);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !price || !sku.trim()) {
      setError('Please provide watch name, brand, SKU, and price.');
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
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      currency: 'INR',
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
      video,
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
        throw new Error(errData.error || 'Failed to save timepiece.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving timepiece.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-luxury-800">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-luxury-900 border border-luxury-800 text-luxury-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-luxury-100 font-semibold">
              {isEdit ? `Edit: ${name}` : 'Add New Timepiece to Vault'}
            </h1>
            <p className="text-xs uppercase tracking-widest text-luxury-400 mt-0.5">
              Horological specifications & Cloudinary photography
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-luxury-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-md transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? 'Update Timepiece' : 'Publish Timepiece'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Timepiece saved successfully! Redirecting...</span>
        </div>
      )}

      {/* SECTION 1: MEDIA UPLOADER */}
      <div className="p-6 sm:p-8 rounded-xl bg-luxury-900/30 border border-luxury-800 space-y-6">
        <h2 className="font-serif text-base text-luxury-100 font-semibold uppercase tracking-wider border-b border-luxury-800 pb-3">
          1. Product Photography & Media
        </h2>
        <MediaUploader
          images={images}
          video={video}
          onChangeImages={setImages}
          onChangeVideo={setVideo}
        />
      </div>

      {/* SECTION 2: CORE DETAILS */}
      <div className="p-6 sm:p-8 rounded-xl bg-luxury-900/30 border border-luxury-800 space-y-6">
        <h2 className="font-serif text-base text-luxury-100 font-semibold uppercase tracking-wider border-b border-luxury-800 pb-3">
          2. Core Identification & Pricing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Timepiece Model Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Royal Oak Selfwinding 'Jumbo' Ultra-Thin"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Brand / Manufacture *
            </label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Audemars Piguet, Rolex, Patek Philippe"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="royal-oak-selfwinding-jumbo"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 font-mono focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="Automatic">Automatic</option>
              <option value="Chronograph">Chronograph</option>
              <option value="Quartz">Quartz</option>
              <option value="Dress">Dress</option>
              <option value="Vintage">Vintage</option>
              <option value="Diver">Diver</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              SKU / Reference Identifier *
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. AP-15202ST-01"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 font-mono uppercase focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Listed Price (INR ₹) *
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="3450000"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 font-mono focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Original Price (INR ₹) (Optional)
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="3600000"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 font-mono focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Availability State
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            >
              <option value="in_stock">In Stock</option>
              <option value="reserved">Reserved</option>
              <option value="sold_out">Sold Out / Acquired</option>
              <option value="made_to_order">Available on Sourcing</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
            Watch Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of dials, finishes, bracelet craftsmanship..."
            className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
            Provenance / Collector Story
          </label>
          <textarea
            rows={2}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="e.g. Preserved with distinction. Complete set including original presentation box..."
            className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-luxury-200">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded bg-luxury-950 border-luxury-700 text-gold focus:ring-gold"
            />
            <span>Feature on Homepage</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-luxury-200">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="rounded bg-luxury-950 border-luxury-700 text-gold focus:ring-gold"
            />
            <span>Mark as New Arrival</span>
          </label>

          <div className="flex items-center gap-2 text-xs text-luxury-300">
            <span>Publish Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-luxury-950 border border-luxury-800 rounded px-2.5 py-1 text-xs text-luxury-100"
            >
              <option value="active">Active (Visible)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: TECHNICAL HOROLOGY SPECS */}
      <div className="p-6 sm:p-8 rounded-xl bg-luxury-900/30 border border-luxury-800 space-y-6">
        <h2 className="font-serif text-base text-luxury-100 font-semibold uppercase tracking-wider border-b border-luxury-800 pb-3">
          3. Horological Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Movement / Calibre
            </label>
            <input
              type="text"
              value={movement}
              onChange={(e) => setMovement(e.target.value)}
              placeholder="e.g. Calibre 2121 Extra-Thin Automatic"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Case Material
            </label>
            <input
              type="text"
              value={caseMaterial}
              onChange={(e) => setCaseMaterial(e.target.value)}
              placeholder="e.g. 316L Steel / 18K Rose Gold"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Case Diameter
            </label>
            <input
              type="text"
              value={caseDiameter}
              onChange={(e) => setCaseDiameter(e.target.value)}
              placeholder="e.g. 39 mm / 40 mm"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Dial & Luminescence
            </label>
            <input
              type="text"
              value={dialColor}
              onChange={(e) => setDialColor(e.target.value)}
              placeholder="e.g. Bleu Nuit Petite Tapisserie"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Strap / Bracelet
            </label>
            <input
              type="text"
              value={strapMaterial}
              onChange={(e) => setStrapMaterial(e.target.value)}
              placeholder="e.g. Integrated Stainless Steel Bracelet"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Water Resistance
            </label>
            <input
              type="text"
              value={waterResistance}
              onChange={(e) => setWaterResistance(e.target.value)}
              placeholder="e.g. 50m / 5 ATM / 300m Diver"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Crystal / Glass
            </label>
            <input
              type="text"
              value={crystal}
              onChange={(e) => setCrystal(e.target.value)}
              placeholder="e.g. Scratch-Resistant Sapphire"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Power Reserve
            </label>
            <input
              type="text"
              value={powerReserve}
              onChange={(e) => setPowerReserve(e.target.value)}
              placeholder="e.g. 70 Hours"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Official Reference No.
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. 15202ST.OO.1240ST.01"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Condition Grade
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Mint / Collector Grade / Unpolished"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-luxury-300 font-medium block">
              Warranty & Verification Coverage
            </label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="e.g. 2 Years Quartz Times Certified Guarantee"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-4 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-luxury-950 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? 'Save Changes' : 'Publish Timepiece'}</span>
        </button>
      </div>
    </form>
  );
};
