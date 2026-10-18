import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/userAuth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(session.userId).lean();
      if (user) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone || '',
          },
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching user profile:', err);
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      phone: session.phone || '',
    },
  });
}
