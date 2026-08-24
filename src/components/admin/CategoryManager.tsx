'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, FolderTree, AlertCircle } from 'lucide-react';
import { ICategory } from '@/types';
import { slugify } from '@/lib/utils';

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
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    const payload = {
      name,
      slug: slugify(name),
      description,
      image,
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
    setEditingId(cat.id || cat._id || null);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('');
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id && c._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form column */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleSave}
          className="p-6 rounded-xl bg-luxury-900/40 border border-luxury-800 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-luxury-800">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-luxury-100 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-gold" />
              {editingId ? 'Edit Classification' : 'Add New Category'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-luxury-400 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage & Rare Complications"
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-3.5 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of horological style, mechanisms, or heritage..."
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-3.5 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-luxury-400 font-medium block">
              Hero Cover Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-luxury-950 border border-luxury-800 rounded-lg px-3.5 py-2.5 text-xs text-luxury-100 focus:border-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-hover text-luxury-950 font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {editingId ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      </div>

      {/* List column */}
      <div className="lg:col-span-7 space-y-4">
        <div className="border border-luxury-800 rounded-xl overflow-hidden bg-luxury-900/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-luxury-950 border-b border-luxury-800 text-[10px] uppercase tracking-widest text-luxury-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-800/60 text-luxury-200">
              {categories.map((cat) => {
                const id = cat.id || cat._id || '';
                return (
                  <tr key={id} className="hover:bg-luxury-900/50">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-luxury-100">{cat.name}</p>
                        {cat.description && (
                          <p className="text-[11px] text-luxury-400 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gold text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded text-luxury-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(id, cat.name)}
                          className="p-1.5 rounded text-rose-400 hover:text-rose-300"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
