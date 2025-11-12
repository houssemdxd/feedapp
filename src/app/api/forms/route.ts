import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FormTemplate from "@/models/FormTemplate";
import { cookies } from "next/headers";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const jar = await cookies();
    const orgUserId = jar.get("org_access")?.value;
    if (!orgUserId || !mongoose.Types.ObjectId.isValid(orgUserId)) {
      return NextResponse.json([]);
    }

    const forms = await FormTemplate.find({ userId: new mongoose.Types.ObjectId(orgUserId) })
      .select("title createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const payload = forms.map((f: any) => ({
      id: String(f._id),
      title: f.title,
      createdAt: f.createdAt ?? null,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Error fetching forms:", err);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}
