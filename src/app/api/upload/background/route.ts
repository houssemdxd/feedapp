import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';
import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/session';
import BackgroundImage from '@/models/BackgroundImage';

function getBlobToken(): string {
  const token =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env["feed_blob_READ_WRITE_TOKEN"] ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      'Blob token environment variable is not set. Expected one of: BLOB_READ_WRITE_TOKEN or feed_blob_READ_WRITE_TOKEN.'
    );
  }
  return token;
}

function extFromMime(mime: string) {
  const ext = mime.split('/')[1]?.toLowerCase() || 'bin';
  return ext === 'jpeg' ? 'jpg' : ext;
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const token = getBlobToken();
    const ext = file.type ? extFromMime(file.type) : (file.name.split('.').pop() || 'bin');
    const filename = `${randomUUID()}.${ext}`;
    const blobPath = `backgrounds/${filename}`;

    const blob = await put(blobPath, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      token,
    });

    // Save metadata to database using the blob URL
    const backgroundImage = await BackgroundImage.create({
      filename,
      originalName: file.name,
      path: blob.url,
      size: file.size,
      userId: user._id,
    });

    // Convert createdAt to ISO string if it exists
    const uploadedAt = backgroundImage.createdAt
      ? new Date(backgroundImage.createdAt).toISOString()
      : new Date().toISOString();

    return NextResponse.json({
      success: true,
      filename,
      path: blob.url,
      id: backgroundImage._id.toString(),
      originalName: file.name,
      size: file.size,
      uploadedAt,
      message: 'Background image uploaded successfully'
    });

  } catch (error) {
    console.error('Background image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
