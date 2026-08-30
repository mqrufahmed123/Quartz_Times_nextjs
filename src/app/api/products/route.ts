import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/services/productService';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const movement = searchParams.get('movement') || undefined;
    const availability = searchParams.get('availability') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sort = (searchParams.get('sort') as any) || undefined;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;

    const result = await getProducts({
      category,
      brand,
      movement,
      availability,
      minPrice,
      maxPrice,
      sort,
      search,
      page,
      limit,
      featured,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Products GET error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve products' },
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
    if (!data.name || !data.brand || !data.description || !data.price || !data.sku) {
      return NextResponse.json(
        { error: 'Name, brand, description, price, and SKU are required.' },
        { status: 400 }
      );
    }

    const created = await createProduct(data);
    revalidatePath('/');
    revalidatePath('/watches');
    revalidatePath(`/watches/${created.slug}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Products POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
