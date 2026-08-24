import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_quartz_times_luxury_horology_2025';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'qt_admin_session';

export interface AdminPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Hash password securely
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for admin session
 */
export async function createSessionToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verify JWT token
 */
export async function verifySessionToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as AdminPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Set session cookie
 */
export function setAdminCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear session cookie
 */
export function removeAdminCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current admin session from request cookies
 */
export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Check if default admin credentials match (for initial setup before DB admin is created)
 */
export function verifyDefaultAdminCredentials(email: string, pass: string): boolean {
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@quartztimes.com';
  const defaultPass = process.env.ADMIN_PASSWORD || 'QuartzLuxury2025!';
  return email.toLowerCase() === defaultEmail.toLowerCase() && pass === defaultPass;
}
