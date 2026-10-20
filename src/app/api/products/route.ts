import { validateProductOptions, normalizeProductVariants } from '@/lib/productValidation';
import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/services/productService';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

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
      productType: searchParams.get('productType') || undefined,
      size: searchParams.get('size') || undefined,
      color: searchParams.get('color') || undefined,
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

    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid product details.' }, { status: 400 });
    const fields = ['name', 'slug', 'brand', 'category', 'productType', 'variants', 'description', 'story', 'price', 'originalPrice', 'currency', 'sku', 'stock', 'availability', 'featured', 'isNewArrival', 'status', 'specifications', 'images', 'video', 'tags'];
    const data = Object.fromEntries(fields.filter(field => field in body).map(field => [field, body[field]]));
    const optionsError = validateProductOptions(data);
    if (optionsError) return NextResponse.json({ error: optionsError }, { status: 400 });
    if (typeof data.price !== 'number' || !Number.isFinite(data.price) || data.price <= 0 ||
        ('stock' in data && (!Number.isSafeInteger(data.stock) || data.stock < 0)) ||
        ('currency' in data && (typeof data.currency !== 'string' || !/^[A-Z]{3}$/.test(data.currency))) ||
        ('slug' in data && (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(data.slug)))) {
      return NextResponse.json({ error: 'Check the price, stock quantity, currency, and URL slug.' }, { status: 400 });
    }
    normalizeProductVariants(data);
    if (!data.name || !data.brand || !data.description || !data.price || !data.sku) {
      return NextResponse.json(
        { error: 'Name, brand, description, price, and SKU are required.' },
        { status: 400 }
      );
    }

    const created = await createProduct(data);
    revalidatePath('/');
    revalidatePath('/watches');
    revalidatePath('/products');
    revalidatePath('/categories/[slug]', 'page');
    revalidatePath('/admin/products');
    revalidateTag('catalogue-filters', 'max');
    revalidatePath(`/watches/${created.slug}`);
    revalidatePath(`/products/${created.slug}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Products POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
