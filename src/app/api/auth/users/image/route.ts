// src/app/api/auth/users/image/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// Get blob token from environment variables
// Vercel may create variables with project-specific prefixes like "feed_blob_READ_WRITE_TOKEN"
function getBlobToken(): string {
  // Check for the token in order of priority:
  // 1. Standard name (BLOB_READ_WRITE_TOKEN)
  // 2. Project-specific name (feed_blob_READ_WRITE_TOKEN) - Vercel auto-created
  // 3. Alternative standard name
  const token =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env["feed_blob_READ_WRITE_TOKEN"] ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    throw new Error(
      "Blob token environment variable is not set. " +
      "Expected one of: BLOB_READ_WRITE_TOKEN or feed_blob_READ_WRITE_TOKEN. " +
      "For local development: Add the token to your .env.local file. " +
      "Get the token from Vercel Dashboard → Project Settings → Environment Variables."
    );
  }
  
  return token;
}

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
function extFromMime(mime: string) {
  const ext = mime.split("/")[1]?.toLowerCase() || "bin";
  return ext === "jpeg" ? "jpg" : ext;
}

/**
 * POST /api/auth/users/image
 * FormData: { file }
 * Saves to Vercel Blob Storage
 * DB: user.image = blob URL (string)
 */
export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return err("Unauthorized", 401);

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return err("Image file is required");
    if (!file.type.startsWith("image/")) return err("Only image files are allowed");
    if (file.size > MAX_SIZE_BYTES) return err("Max image size is 2MB");

    await connectDB();

    // delete previous file if existed
    const prev = await User.findById(me._id).select("image");
    if (prev?.image) {
      try {
        // Only delete if it's a blob URL (starts with http), skip old local paths
        if (prev.image.startsWith("http")) {
          const token = getBlobToken();
          await del(prev.image, { token });
        }
      } catch (e) {
        // Ignore errors when deleting old blob (might not exist)
        console.warn("Failed to delete previous blob:", e);
      }
    }

    const folder = me.role === "organization" ? "logos" : "avatars";
    const ext = extFromMime(file.type);
    const filename = `${me._id}-${randomUUID()}.${ext}`;
    const blobPath = `${folder}/${filename}`;

    // Get token and upload to Vercel Blob
    const token = getBlobToken();
    const blob = await put(blobPath, file, {
      access: "public",
      contentType: file.type,
      token,
    });

    console.log("image blob URL to save in route.ts is :", blob.url);
    await User.findByIdAndUpdate(me._id, { image: blob.url });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("Upload failed:", e);
    return err("Upload failed", 500);
  }
}

/**
 * DELETE /api/auth/users/image
 * Removes blob from Vercel Blob Storage & clears image string
 */
export async function DELETE() {
  try {
    const me = await getCurrentUser();
    if (!me) return err("Unauthorized", 401);

    await connectDB();
    const doc = await User.findById(me._id).select("image");
    if (doc?.image) {
      try {
        // Only delete if it's a blob URL (starts with http), skip old local paths
        if (doc.image.startsWith("http")) {
          const token = getBlobToken();
          await del(doc.image, { token });
        }
      } catch (e) {
        // Ignore errors when deleting blob (might not exist)
        console.warn("Failed to delete blob:", e);
      }
    }
    await User.findByIdAndUpdate(me._id, { image: null });

    return NextResponse.json({ ok: true, url: null });
  } catch (e) {
    console.error("Delete failed:", e);
    return err("Delete failed", 500);
  }
}
