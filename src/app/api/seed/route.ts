import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Inquiry from '@/models/Inquiry';
import Admin from '@/models/Admin';
import { sampleProducts, sampleCategories, sampleInquiries } from '@/lib/mockData';
import { hashPassword } from '@/lib/auth';
import { getAdminSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: true,
        message: 'Database not connected yet, operating in active in-memory / seed mode.',
        productsCount: sampleProducts.length,
      });
    }

    // 1. Seed Categories
    for (const cat of sampleCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          active: cat.active,
        },
        { upsert: true, new: true }
      );
    }

    // 2. Seed Products
    for (const prod of sampleProducts) {
      await Product.findOneAndUpdate(
        { slug: prod.slug },
        {
          name: prod.name,
          slug: prod.slug,
          brand: prod.brand,
          category: prod.category,
          description: prod.description,
          story: prod.story,
          price: prod.price,
          originalPrice: prod.originalPrice,
          currency: prod.currency || 'INR',
          sku: prod.sku,
          stock: prod.stock,
          availability: prod.availability,
          featured: prod.featured,
          isNewArrival: prod.isNewArrival,
          status: prod.status || 'active',
          specifications: prod.specifications,
          images: prod.images,
          video: prod.video,
        },
        { upsert: true, new: true }
      );
    }

    // 3. Seed Sample Inquiries
    for (const inq of sampleInquiries) {
      await Inquiry.findOneAndUpdate(
        { email: inq.email, message: inq.message },
        {
          name: inq.name,
          phone: inq.phone,
          email: inq.email,
          product: inq.product,
          productId: inq.productId,
          productSku: inq.productSku,
          message: inq.message,
          status: inq.status,
        },
        { upsert: true, new: true }
      );
    }

    // 4. Seed Default Admin if none exists
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPass) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required before seeding.');
    }
    const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      const passwordHash = await hashPassword(adminPass);
      await Admin.create({
        email: adminEmail.toLowerCase(),
        passwordHash,
        name: 'Quartz Times Director',
        role: 'superadmin',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'MongoDB vault seeded successfully with 15+ horological references.',
      seededCount: sampleProducts.length,
    });
  } catch (err: any) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
