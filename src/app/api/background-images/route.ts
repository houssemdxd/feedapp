import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/session';
import BackgroundImage from '@/models/BackgroundImage';

export async function GET() {
  try {
    await connectDB();

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's background images
    const backgroundImages = await BackgroundImage.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('filename originalName path size createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      backgroundImages: backgroundImages.map(img => ({
        id: (img as any)._id.toString(),
        filename: img.filename,
        originalName: img.originalName,
        path: img.path,
        size: img.size,
        uploadedAt: img.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching background images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch background images' },
      { status: 500 }
    );
  }
}
