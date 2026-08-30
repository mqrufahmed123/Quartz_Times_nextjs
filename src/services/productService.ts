import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import Product, { IProductDocument } from '@/models/Product';
import { IProduct, IProductFilterQuery, IPaginatedResult } from '@/types';
import { sampleProducts } from '@/lib/mockData';
import { slugify } from '@/lib/utils';

// In-memory runtime store for dev/demonstration when DB is not actively reachable
let inMemoryProducts: IProduct[] = [...sampleProducts];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function serializeImages(images: any[]): any[] {
  if (!Array.isArray(images)) return [];
  return images.map((img) => ({
    url: img.url ?? '',
    publicId: img.publicId ?? undefined,
    alt: img.alt ?? '',
    isPrimary: img.isPrimary ?? false,
    width: img.width ?? undefined,
    height: img.height ?? undefined,
    // Intentionally omit _id — IProductMedia has no _id field and sub-doc ObjectIds
    // with toJSON methods break Next.js Server → Client serialization.
  }));
}

function documentToProduct(doc: any): IProduct {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: obj._id ? obj._id.toString() : obj.id,
    specifications: obj.specifications ? { ...obj.specifications } : {},
    images: serializeImages(obj.images),
    video: obj.video?.url
      ? {
          url: obj.video.url,
          publicId: obj.video.publicId ?? undefined,
          thumbnailUrl: obj.video.thumbnailUrl ?? undefined,
        }
      : undefined,
    tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
  };
}

export async function getProducts(
  params: IProductFilterQuery = {}
): Promise<IPaginatedResult<IProduct>> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(params.limit) || 12));
  const skip = (page - 1) * limit;

  try {
    const conn = await connectToDatabase();
    if (conn) {
      // Build MongoDB query
      const query: any = params.includeInactive ? { status: { $ne: 'archived' } } : { status: 'active' };

      if (params.category && params.category !== 'all') {
        query.category = { $regex: new RegExp(`^${escapeRegExp(params.category)}$`, 'i') };
      }

      if (params.brand && params.brand !== 'all') {
        query.brand = { $regex: new RegExp(`^${escapeRegExp(params.brand)}$`, 'i') };
      }

      if (params.movement && params.movement !== 'all') {
        query['specifications.movement'] = { $regex: new RegExp(escapeRegExp(params.movement), 'i') };
      }

      if (params.availability && params.availability !== 'all') {
        query.availability = params.availability;
      }

      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        query.price = {};
        if (params.minPrice !== undefined) query.price.$gte = Number(params.minPrice);
        if (params.maxPrice !== undefined) query.price.$lte = Number(params.maxPrice);
      }

      if (params.featured !== undefined) {
        query.featured = params.featured;
      }

      if (params.search && params.search.trim()) {
        const searchRegex = new RegExp(escapeRegExp(params.search.trim().slice(0, 100)), 'i');
        query.$or = [
          { name: searchRegex },
          { brand: searchRegex },
          { description: searchRegex },
          { sku: searchRegex },
          { 'specifications.referenceNumber': searchRegex },
        ];
      }

      // Sort
      let sortOptions: any = { featured: -1, createdAt: -1 };
      if (params.sort === 'newest') {
        sortOptions = { createdAt: -1 };
      } else if (params.sort === 'price-low') {
        sortOptions = { price: 1 };
      } else if (params.sort === 'price-high') {
        sortOptions = { price: -1 };
      }

      const total = await Product.countDocuments(query);
      const docs = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      if (total > 0) {
        const items = docs.map(documentToProduct);
        return {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        };
      }
    }
  } catch (err) {
    console.warn('Product query error, falling back to local dataset:', err);
  }

  // Graceful fallback to memory/mock data
  let filtered = [...inMemoryProducts].filter((p) =>
    params.includeInactive ? p.status !== 'archived' : p.status === 'active'
  );

  if (params.category && params.category !== 'all') {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === params.category?.toLowerCase()
    );
  }

  if (params.brand && params.brand !== 'all') {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === params.brand?.toLowerCase()
    );
  }

  if (params.movement && params.movement !== 'all') {
    filtered = filtered.filter((p) =>
      p.specifications?.movement?.toLowerCase().includes(params.movement!.toLowerCase())
    );
  }

  if (params.availability && params.availability !== 'all') {
    filtered = filtered.filter((p) => p.availability === params.availability);
  }

  if (params.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= Number(params.minPrice));
  }

  if (params.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= Number(params.maxPrice));
  }

  if (params.featured !== undefined) {
    filtered = filtered.filter((p) => p.featured === params.featured);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.specifications?.referenceNumber?.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (params.sort === 'newest') {
    filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  } else if (params.sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    // featured
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  const total = filtered.length;
  const paginatedItems = filtered.slice(skip, skip + limit);

  return {
    items: paginatedItems,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    hasMore: page * limit < total,
  };
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  if (!slug) return null;

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await Product.findOne({ slug, status: 'active' }).lean();
      if (doc) {
        return documentToProduct(doc);
      }
    }
  } catch (err) {
    console.warn('Error finding product by slug:', err);
  }

  const found = inMemoryProducts.find((p) => p.slug === slug && p.status === 'active');
  return found || null;
}

export async function getProductById(id: string): Promise<IProduct | null> {
  if (!id) return null;

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await Product.findById(id).lean();
      if (doc) {
        return documentToProduct(doc);
      }
    }
  } catch (err) {
    console.warn('Error finding product by id:', err);
  }

  const found = inMemoryProducts.find((p) => p.id === id || p._id === id);
  return found || null;
}

export async function getFeaturedProducts(limit = 6): Promise<IProduct[]> {
  const result = await getProducts({ featured: true, limit, sort: 'featured' });
  if (result.items.length > 0) return result.items;
  const all = await getProducts({ limit });
  return all.items;
}

export async function getNewArrivals(limit = 6): Promise<IProduct[]> {
  const result = await getProducts({ limit, sort: 'newest' });
  return result.items;
}

export async function getRelatedProducts(
  currentSlug: string,
  category?: string,
  brand?: string,
  limit = 4
): Promise<IProduct[]> {
  const all = await getProducts({ limit: 16 });
  return all.items
    .filter((p) => p.slug !== currentSlug)
    .filter((p) => !category || p.category === category || p.brand === brand)
    .slice(0, limit);
}

export async function getDistinctBrands(): Promise<string[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const brands = await Product.distinct('brand', { status: 'active' });
      if (brands && brands.length > 0) return brands.sort();
    }
  } catch (err) {
    // fallback
  }

  const brands = Array.from(new Set(inMemoryProducts.map((p) => p.brand)));
  return brands.sort();
}

export async function getDistinctMovements(): Promise<string[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const movements = await Product.distinct('specifications.movement', { status: 'active' });
      if (movements && movements.length > 0) return movements.filter(Boolean).sort();
    }
  } catch (err) {
    // fallback
  }

  return ['Automatic', 'Manual-Winding', 'Quartz', 'Spring Drive', 'Co-Axial Master Chronometer'];
}

export async function createProduct(data: Partial<IProduct>): Promise<IProduct> {
  const slug = data.slug || slugify(data.name || 'timepiece');

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const duplicate = await Product.findOne({ $or: [{ slug }, { sku: data.sku?.toUpperCase() }] })
        .select('slug sku')
        .lean();
      if (duplicate) {
        throw new Error(
          duplicate.slug === slug
            ? 'A watch with this URL slug already exists.'
            : 'A watch with this SKU already exists.'
        );
      }
      const doc = await Product.create({
        ...data,
        slug,
      });
      const saved = documentToProduct(doc);
      inMemoryProducts.unshift(saved);
      return saved;
    }
    if (process.env.MONGODB_URI) {
      throw new Error('Database is unavailable. The watch was not saved.');
    }
  } catch (err) {
    console.error('Error creating product in DB:', err);
    if (process.env.MONGODB_URI) throw err;
  }

  const newProd: IProduct = {
    id: `prod-${Date.now()}`,
    _id: `prod-${Date.now()}`,
    name: data.name || 'Untitled Timepiece',
    slug,
    brand: data.brand || 'Horology Atelier',
    category: data.category || 'Automatic',
    description: data.description || '',
    story: data.story || '',
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    currency: data.currency || 'INR',
    sku: data.sku || `QT-${Date.now().toString().slice(-6)}`,
    stock: data.stock !== undefined ? Number(data.stock) : 1,
    availability: data.availability || 'in_stock',
    featured: Boolean(data.featured),
    isNewArrival: Boolean(data.isNewArrival),
    status: data.status || 'active',
    specifications: data.specifications || {},
    images: data.images || [],
    video: data.video,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryProducts.unshift(newProd);
  return newProd;
}

export async function updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
  try {
    const conn = await connectToDatabase();
    if (conn && mongoose.isValidObjectId(id)) {
      const doc = await Product.findByIdAndUpdate(id, data, { new: true });
      if (doc) {
        const updated = documentToProduct(doc);
        inMemoryProducts = inMemoryProducts.map((p) => (p.id === id || p._id === id ? updated : p));
        return updated;
      }
      return null;
    }
  } catch (err) {
    console.error('Error updating product in DB:', err);
    if (process.env.MONGODB_URI) throw err;
  }

  if (process.env.MONGODB_URI && mongoose.isValidObjectId(id)) {
    throw new Error('Database is unavailable. The watch was not updated.');
  }

  const index = inMemoryProducts.findIndex((p) => p.id === id || p._id === id);
  if (index !== -1) {
    inMemoryProducts[index] = {
      ...inMemoryProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryProducts[index];
  }

  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    if (conn && mongoose.isValidObjectId(id)) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return false;
      return true;
    }
  } catch (err) {
    console.error('Error deleting product in DB:', err);
    if (process.env.MONGODB_URI) throw err;
  }

  if (process.env.MONGODB_URI && mongoose.isValidObjectId(id)) {
    throw new Error('Database is unavailable. The watch was not deleted.');
  }

  inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id && p._id !== id);
  return true;
}
