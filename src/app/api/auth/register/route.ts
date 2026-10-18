import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { readJson, requestErrorResponse, requireSameOrigin } from '@/lib/requestSecurity';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
  hashUserPassword,
  createUserSessionToken,
  setUserCookie,
} from '@/lib/userAuth';

export async function POST(req: NextRequest) {
  try {
    requireSameOrigin(req);
    await enforceRateLimit('registration-global', 'all', 30, 60 * 60_000);
    const { name, email, password, phone } = await readJson(req);

    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters and at most 72 bytes.' },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    if (phone !== undefined && (typeof phone !== 'string' || (phone && !/^\+?[0-9]{10,15}$/.test(phone.trim())))) return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
    if (!conn) {
      return NextResponse.json(
        { error: 'Database is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashUserPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? phone.trim() : '',
    });

    const token = await createUserSessionToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
    });

    await setUserCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    return requestErrorResponse(err, 'Registration is temporarily unavailable.');
  }
}
