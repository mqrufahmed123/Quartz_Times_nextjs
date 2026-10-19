import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getProductById } from '@/services/productService';
import { getCategories } from '@/services/categoryService';

const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401, headers });
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404, headers });
    const categories = await getCategories(false);
    return NextResponse.json({ product, categories }, { headers });
  } catch {
    return NextResponse.json({ error: 'Unable to load the product editor. Please try again.' }, { status: 500, headers });
  }
}
