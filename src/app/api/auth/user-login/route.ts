import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { readJson, requestErrorResponse, requireSameOrigin } from '@/lib/requestSecurity';
import { limitLogin } from '@/lib/rateLimit';
import {
  compareUserPassword,
  createUserSessionToken,
  setUserCookie,
} from '@/lib/userAuth';

export async function POST(req: NextRequest) {
  try {
    requireSameOrigin(req);
    const { email, password } = await readJson(req);

    if (typeof email !== 'string' || !email || email.length > 254 || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await limitLogin('customer-login', email);
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { error: 'Database is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const match = await compareUserPassword(password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
    return requestErrorResponse(err, 'Authentication is temporarily unavailable.');
  }
}
