// src/app/api/auth/users/image/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOADS_BASE = process.env.UPLOADS_BASE_DIR || "uploads"; // visible as /uploads/...

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
function extFromMime(mime: string) {
  const ext = mime.split("/")[1]?.toLowerCase() || "bin";
  return ext === "jpeg" ? "jpg" : ext;
}
async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}
async function unlinkIfExists(filePath: string) {
  try { await fs.unlink(filePath); } catch (e: any) { if (e?.code !== "ENOENT") throw e; }
}

/**
 * POST /api/auth/users/image
 * FormData: { file }
 * Saves to /public/uploads/{avatars|logos}/{userId}-{uuid}.{ext}
 * DB: user.image = "/uploads/.../filename.ext" (string)
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

    const folder = me.role === "organization" ? "logos" : "avatars";
    const ext = extFromMime(file.type);
    const filename = `${me._id}-${randomUUID()}.${ext}`;

    // absolute dir & path
    const absDir = path.join(PUBLIC_DIR, UPLOADS_BASE, folder);
    const relPath = path.join("/", UPLOADS_BASE, folder, filename).replace(/\\+/g, "/"); // public path
    const absPath = path.join(PUBLIC_DIR, relPath);

    await ensureDir(absDir);
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absPath, buf, { flag: "w" });

    await connectDB();

    // delete previous file if existed
    const prev = await User.findById(me._id).select("image");
    if (prev?.image && prev.image !== relPath) {
      // prev.image is a string; remove leading "/" when joining
      const prevAbs = path.join(PUBLIC_DIR, prev.image.startsWith("/") ? prev.image.slice(1) : prev.image);
      await unlinkIfExists(prevAbs);
    }
    console.log("image page to save in route.ts is :", relPath);
    await User.findByIdAndUpdate(me._id, { image: relPath });

    return NextResponse.json({ ok: true, url: relPath });
  } catch (e) {
    return err("Upload failed", 500);
  }
}

/**
 * DELETE /api/auth/users/image
 * Removes local file & clears image string
 */
export async function DELETE() {
  try {
    const me = await getCurrentUser();
    if (!me) return err("Unauthorized", 401);

    await connectDB();
    const doc = await User.findById(me._id).select("image");
    if (doc?.image) {
      const abs = path.join(PUBLIC_DIR, doc.image.startsWith("/") ? doc.image.slice(1) : doc.image);
      await unlinkIfExists(abs);
    }
    await User.findByIdAndUpdate(me._id, { image: null });

    return NextResponse.json({ ok: true, url: null });
  } catch {
    return err("Delete failed", 500);
  }
}
