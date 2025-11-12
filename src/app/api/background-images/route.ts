import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
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

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }

    // Find the background image record
    const backgroundImage = await BackgroundImage.findOne({
      path,
      userId: user._id
    });

    if (!backgroundImage) {
      return NextResponse.json(
        { error: 'Background image not found' },
        { status: 404 }
      );
    }

    // Delete the file from filesystem
    const filepath = join(process.cwd(), 'public', path);
    try {
      await unlink(filepath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the record from database
    await BackgroundImage.deleteOne({ _id: backgroundImage._id });

    return NextResponse.json({
      success: true,
      message: 'Background image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting background image:', error);
    return NextResponse.json(
      { error: 'Failed to delete background image' },
      { status: 500 }
    );
  }
}
