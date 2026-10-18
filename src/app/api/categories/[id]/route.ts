import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/services/categoryService';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const updated = await updateCategory(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    revalidateTag('catalogue-filters', 'max');
    revalidatePath('/');
    revalidatePath('/watches');
    revalidatePath('/admin/categories');
    revalidatePath('/categories', 'layout');
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    revalidateTag('catalogue-filters', 'max');
    revalidatePath('/');
    revalidatePath('/watches');
    revalidatePath('/admin/categories');
    revalidatePath('/categories', 'layout');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
