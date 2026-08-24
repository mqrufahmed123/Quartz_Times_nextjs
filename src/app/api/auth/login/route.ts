import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  setAdminCookie,
  verifyDefaultAdminCredentials,
} from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    let isValid = false;
    let userId = 'admin-root';
    let userRole = 'admin';

    // 1. Check default configured admin credentials
    if (verifyDefaultAdminCredentials(email, password)) {
      isValid = true;
    } else {
      // 2. Check Database Admin model
      const conn = await connectToDatabase();
      if (conn) {
        const adminDoc = await Admin.findOne({ email: email.toLowerCase() });
        if (adminDoc && (await bcrypt.compare(password, adminDoc.passwordHash))) {
          isValid = true;
          userId = adminDoc._id.toString();
          userRole = adminDoc.role;
        }
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid horology atelier credentials.' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSessionToken({
      userId,
      email: email.toLowerCase(),
      role: userRole,
    });

    // Set cookie
    setAdminCookie(token);

    return NextResponse.json({
      success: true,
      user: { email: email.toLowerCase(), role: userRole },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
