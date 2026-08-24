import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/services/categoryService';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await getCategories(false);
    return NextResponse.json(categories);
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
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
