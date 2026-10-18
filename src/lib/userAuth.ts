import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const USER_COOKIE_NAME = 'qt_user_session';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }
  return new TextEncoder().encode(secret || 'quartz-times-local-development-secret');
}

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
  phone?: string;
}

export async function hashUserPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function compareUserPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUserSessionToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setAudience('qt-customer')
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

export async function verifyUserSessionToken(
  token: string
): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'], audience: 'qt-customer' });
    if (typeof payload.userId !== 'string' || !/^[a-f0-9]{24}$/i.test(payload.userId) || typeof payload.email !== 'string' || typeof payload.name !== 'string') return null;
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function setUserCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function removeUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}

export async function getUserSession(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = await verifyUserSessionToken(token);
    if (!payload || !await connectToDatabase()) return null;
    const user = await User.findById(payload.userId).lean();
    if (!user) return null;
    return { userId: String(user._id), name: user.name, email: user.email, phone: user.phone };
  } catch {
    return null;
  }
}
