'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit2, Trash2, ExternalLink, Search, Star, Plus } from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

export interface ProductTableProps {
  initialProducts: IProduct[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ initialProducts }) => {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you wish to delete "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => (p.id !== id && p._id !== id)));
      } else {
        alert('Failed to delete product.');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (product: IProduct) => {
    const newFeatured = !product.featured;
    try {
      const id = product.id || product._id;
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured }),
      });

      if (res.ok) {
        setProducts(
          products.map((p) =>
            (p.id === id || p._id === id) ? { ...p, featured: newFeatured } : p
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-luxury-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search watches by name, SKU, brand..."
            className="w-full bg-luxury-900 border border-luxury-800 rounded-lg pl-9 pr-4 py-2 text-xs text-luxury-100 placeholder-luxury-500 focus:border-gold focus:outline-none"
          />
        </div>

        <Link
          href="/admin/products/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-luxury-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Timepiece</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="border border-luxury-800 rounded-xl overflow-hidden bg-luxury-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-luxury-950 border-b border-luxury-800 text-[10px] uppercase tracking-widest text-luxury-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Watch</th>
                <th className="py-3.5 px-4">SKU / Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (INR)</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-800/60 text-luxury-200">
              {filtered.length > 0 ? (
                filtered.map((prod) => {
                  const id = prod.id || prod._id || '';
                  const img = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop';
                  return (
                    <tr key={id} className="hover:bg-luxury-900/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-luxury-950 shrink-0 border border-luxury-800">
                            <Image
                              src={img}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-serif font-medium text-luxury-100 line-clamp-1">
                              {prod.name}
                            </p>
                            <span className="text-[10px] text-luxury-500 font-mono">
                              {prod.specifications?.referenceNumber || prod.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-gold block">{prod.brand}</span>
                          <span className="text-[10px] text-luxury-400 font-mono">{prod.sku}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-luxury-300">{prod.category}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-serif font-bold text-luxury-100">
                          {formatPrice(prod.price, prod.currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            prod.availability === 'in_stock'
                              ? 'gold'
                              : prod.availability === 'reserved'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {prod.availability.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(prod)}
                          title="Toggle Featured on Homepage"
                          className={`p-1.5 rounded-full transition-colors ${
                            prod.featured
                              ? 'text-gold bg-gold/15'
                              : 'text-luxury-600 hover:text-luxury-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${prod.featured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/watches/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 rounded text-luxury-400 hover:text-gold transition-colors"
                            title="View on site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/products/${id}/edit`}
                            className="p-1.5 rounded text-luxury-400 hover:text-white transition-colors"
                            title="Edit timepiece"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            disabled={deletingId === id}
                            onClick={() => handleDelete(id, prod.name)}
                            className="p-1.5 rounded text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
                            title="Delete timepiece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-luxury-500">
                    No timepieces matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
