import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Get current user
    const token = (await cookies()).get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken<{ userId: string }>(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate userId format
    if (!payload.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    // Find user and return their access code
    const user = await User.findById(payload.userId).select('generatedCode');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      generatedCode: user.generatedCode || null
    });

  } catch (error) {
    console.error('Error fetching user access code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access code' },
      { status: 500 }
    );
  }
}
