import { MetadataRoute } from 'next';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const [productsData, categories] = await Promise.all([
    getProducts({ limit: 100 }),
    getCategories(true),
  ]);

  const staticRoutes = [
    '',
    '/watches',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = productsData.items.map((prod) => ({
    url: `${baseUrl}/watches/${prod.slug}`,
    lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
