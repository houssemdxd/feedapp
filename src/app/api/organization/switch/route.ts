import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Preferences from "@/models/Preferences";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { orgUserId } = await req.json();
    if (!orgUserId || !mongoose.Types.ObjectId.isValid(orgUserId)) {
      return NextResponse.json({ error: "Invalid orgUserId" }, { status: 400 });
    }

    const prefs = await Preferences.findOne({ userId: new mongoose.Types.ObjectId(orgUserId) }).lean();
    if (!prefs) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const res = NextResponse.json({ success: true, preferences: prefs });
    // set org_access cookie so subsequent /api/forms returns this org forms
    res.cookies.set("org_access", String(orgUserId), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    console.error("POST /api/organization/switch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
