import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  setAdminCookie,
  verifyDefaultAdminCredentials,
} from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { readJson, requestErrorResponse, requireSameOrigin } from '@/lib/requestSecurity';
import { limitLogin } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    requireSameOrigin(req);
    const { email, password } = await readJson(req);

    if (typeof email !== 'string' || !email.trim() || email.length > 254 || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }
    await limitLogin('admin-login', email);

    let isValid = false;
    let userId = 'admin-root';
    let userRole = 'admin';

    // 1. Check default configured admin credentials
    if (verifyDefaultAdminCredentials(email, password)) {
      isValid = true;
      userRole = 'superadmin';
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
    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      user: { email: email.toLowerCase(), role: userRole },
    });
  } catch (err: any) {
    return requestErrorResponse(err, 'Authentication is temporarily unavailable.');
  }
}
