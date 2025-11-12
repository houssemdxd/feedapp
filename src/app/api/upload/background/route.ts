import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/session';
import BackgroundImage from '@/models/BackgroundImage';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const extension = file.name.split('.').pop();
    const filename = `${uuidv4()}.${extension}`;

    // Save to public/images/backgrounds directory
    const uploadDir = join(process.cwd(), 'public', 'images', 'backgrounds');

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
      console.log('Directory creation result:', error);
    }

    const filepath = join(uploadDir, filename);

    // Write the file
    await writeFile(filepath, buffer);

    // Save metadata to database
    const backgroundImage = await BackgroundImage.create({
      filename,
      originalName: file.name,
      path: `/images/backgrounds/${filename}`,
      size: buffer.length,
      userId: user._id,
    });

    // Return the path that can be used in the app
    const fileUrl = `/images/backgrounds/${filename}`;

    // Convert createdAt to ISO string if it exists
    const uploadedAt = backgroundImage.createdAt 
      ? new Date(backgroundImage.createdAt).toISOString()
      : new Date().toISOString();

    return NextResponse.json({
      success: true,
      filename,
      path: fileUrl,
      id: backgroundImage._id.toString(),
      originalName: file.name,
      size: buffer.length,
      uploadedAt,
      message: 'Background image uploaded successfully'
    });

  } catch (error) {
    console.error('Background image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
