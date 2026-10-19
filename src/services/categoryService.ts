import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import Category, { ICategoryDocument } from '@/models/Category';
import { ICategory } from '@/types';
import { sampleCategories } from '@/lib/mockData';
import { slugify } from '@/lib/utils';
import { getBrowserImageUrl } from '@/lib/imageDelivery';

let inMemoryCategories: ICategory[] = [...sampleCategories];

function documentToCategory(doc: any): ICategory {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    image: obj.image ? getBrowserImageUrl(obj.image) : obj.image,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: obj._id ? obj._id.toString() : obj.id,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
  };
}

export async function getCategories(onlyActive = true): Promise<ICategory[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const query = onlyActive ? { active: true } : {};
      const docs = await Category.find(query).sort({ name: 1 }).lean();
      return docs.map(documentToCategory);
    }
  } catch (err) {
    console.warn('Category query error:', err);
  }

  if (process.env.MONGODB_URI) return [];
  return onlyActive ? inMemoryCategories.filter((c) => c.active) : inMemoryCategories;
}

export async function getCategoryBySlug(slug: string): Promise<ICategory | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await Category.findOne({ slug, active: true }).lean();
      return doc ? documentToCategory(doc) : null;
    }
  } catch (err) {
    console.warn('Error fetching category by slug:', err);
  }

  if (process.env.MONGODB_URI) return null;
  return inMemoryCategories.find((c) => c.slug === slug && c.active) || null;
}

export async function createCategory(data: Partial<ICategory>): Promise<ICategory> {
  const slug = data.slug || slugify(data.name || 'category');

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await Category.create({ ...data, slug });
      const saved = documentToCategory(doc);
      inMemoryCategories.push(saved);
      return saved;
    }
  } catch (err) {
    console.error('Error creating category:', err);
    if (process.env.MONGODB_URI) throw err;
  }

  if (process.env.MONGODB_URI) {
    throw new Error('Database is unavailable. The category was not saved.');
  }

  const newCat: ICategory = {
    id: `cat-${Date.now()}`,
    _id: `cat-${Date.now()}`,
    name: data.name || 'Untitled Category',
    slug,
    description: data.description || '',
    image: data.image || '',
    active: data.active !== undefined ? Boolean(data.active) : true,
    itemCount: 0,
    createdAt: new Date().toISOString(),
  };

  inMemoryCategories.push(newCat);
  return newCat;
}

export async function updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      let doc = null;
      if (mongoose.isValidObjectId(id)) {
        doc = await Category.findByIdAndUpdate(id, data, { new: true });
      } else {
        const mockMatch = sampleCategories.find((c) => c.id === id);
        const slug = mockMatch ? mockMatch.slug : id;
        doc = await Category.findOneAndUpdate({ slug }, data, { new: true });
      }
      if (doc) {
        const updated = documentToCategory(doc);
        inMemoryCategories = inMemoryCategories.map((c) => (c.id === id || c._id === id ? updated : c));
        return updated;
      }
      return null;
    }
  } catch (err) {
    console.error('Error updating category:', err);
    if (process.env.MONGODB_URI) throw err;
  }

  if (process.env.MONGODB_URI && mongoose.isValidObjectId(id)) {
    throw new Error('Database is unavailable. The category was not updated.');
  }

  const idx = inMemoryCategories.findIndex((c) => c.id === id || c._id === id);
  if (idx !== -1) {
    inMemoryCategories[idx] = {
      ...inMemoryCategories[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryCategories[idx];
  }
  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      let deleted = null;
      if (mongoose.isValidObjectId(id)) {
        deleted = await Category.findByIdAndDelete(id);
      } else {
        const mockMatch = sampleCategories.find((c) => c.id === id);
        const slug = mockMatch ? mockMatch.slug : id;
        deleted = await Category.findOneAndDelete({ slug });
      }
      inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id && c._id !== id);
      return Boolean(deleted);
    }
  } catch (err) {
    console.error('Error deleting category:', err);
    if (process.env.MONGODB_URI) throw err;
  }

  if (process.env.MONGODB_URI && mongoose.isValidObjectId(id)) {
    throw new Error('Database is unavailable. The category was not deleted.');
  }

  inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id && c._id !== id);
  return true;
}
