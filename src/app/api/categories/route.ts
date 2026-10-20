import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/services/categoryService';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const categories = await getCategories(req.nextUrl.searchParams.get('active') === 'true');
    return NextResponse.json(categories, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const created = await createCategory(data);
    revalidateTag('catalogue-filters', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/watches');
    revalidatePath('/products');
    revalidatePath('/admin/categories');
    revalidatePath('/categories/[slug]', 'page');
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
