import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';

function getBlobToken(): string {
  const token =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env["feed_blob_READ_WRITE_TOKEN"] ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Blob token environment variable is not set. Expected one of: BLOB_READ_WRITE_TOKEN or feed_blob_READ_WRITE_TOKEN."
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
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const token = getBlobToken();
    const ext = file.type ? extFromMime(file.type) : (file.name.split('.').pop() || 'bin');
    const filename = `${randomUUID()}.${ext}`;
    const blobPath = `logos/${filename}`;

    const blob = await put(blobPath, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      token,
    });

    return NextResponse.json({
      success: true,
      filename,
      path: blob.url,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
