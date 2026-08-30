import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from '@/services/productService';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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

    const data = await req.json();
    const isFullProductUpdate = ['name', 'brand', 'description', 'price', 'sku'].some(
      (field) => field in data
    );
    if (isFullProductUpdate && (!data.name || !data.brand || !data.description || !data.price || !data.sku)) {
      return NextResponse.json(
        { error: 'Name, brand, description, price, and SKU are required.' },
        { status: 400 }
      );
    }
    const updated = await updateProduct(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found for update' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/watches');
    revalidatePath(`/watches/${updated.slug}`);

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
