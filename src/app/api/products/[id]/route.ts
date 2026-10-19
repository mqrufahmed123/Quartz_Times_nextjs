import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from '@/services/productService';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (product.status !== 'active' && !(await getAdminSession())) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid product details.' }, { status: 400 });
    const fields = ['name', 'slug', 'brand', 'category', 'description', 'story', 'price', 'originalPrice', 'currency', 'sku', 'stock', 'availability', 'featured', 'isNewArrival', 'status', 'specifications', 'images', 'video', 'tags'];
    const data = Object.fromEntries(fields.filter(field => field in body).map(field => [field, body[field]]));
    const isFullProductUpdate = ['name', 'brand', 'description', 'price', 'sku'].some(
      (field) => field in data
    );
    if (isFullProductUpdate && (!data.name || !data.brand || !data.description || !data.price || !data.sku)) {
      return NextResponse.json(
        { error: 'Name, brand, description, price, and SKU are required.' },
        { status: 400 }
      );
    }
    if (
      ('price' in data && (typeof data.price !== 'number' || !Number.isFinite(data.price) || data.price <= 0)) ||
      ('originalPrice' in data && data.originalPrice !== null && (typeof data.originalPrice !== 'number' || !Number.isFinite(data.originalPrice) || data.originalPrice < 0)) ||
      ('stock' in data && (!Number.isSafeInteger(data.stock) || data.stock < 0)) ||
      ('currency' in data && (typeof data.currency !== 'string' || !/^[A-Z]{3}$/.test(data.currency))) ||
      ('slug' in data && (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(data.slug)))
    ) return NextResponse.json({ error: 'Check the price, stock quantity, currency, and URL slug.' }, { status: 400 });

    const previous = await getProductById(id);
    if (!previous) return NextResponse.json({ error: 'Product not found for update' }, { status: 404 });
    const updated = await updateProduct(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found for update' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/watches');
    revalidatePath(`/watches/${updated.slug}`);
    if (previous.slug !== updated.slug) revalidatePath(`/watches/${previous.slug}`);
    revalidatePath('/categories/[slug]', 'page');
    revalidatePath('/admin/products');
    revalidateTag('catalogue-filters', 'max');

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    revalidatePath('/');
    revalidatePath('/watches');
    return NextResponse.json({ success: true, message: 'Watch deleted' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error deleting product' },
      { status: 500 }
    );
  }
}
