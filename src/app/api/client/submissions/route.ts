import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import FormResponse from "@/models/FormResponse";
import FormTemplate from "@/models/FormTemplate";
import Preferences from "@/models/Preferences";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    const jar = await cookies();
    const orgCookie = jar.get("org_access")?.value;
    const respondentIdStr = (user as any)?._id || orgCookie;
    if (!respondentIdStr || !mongoose.Types.ObjectId.isValid(respondentIdStr)) {
      return NextResponse.json([], { status: 200 });
    }
    const respondentId = new mongoose.Types.ObjectId(respondentIdStr);

    // Fetch responses for this respondent
    const responses = await FormResponse.find({ respondentId })
      .select("formId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!responses.length) return NextResponse.json([]);

    const formIds = Array.from(new Set(responses.map((r) => String(r.formId)))).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const forms = await FormTemplate.find({ _id: { $in: formIds } })
      .select("_id title userId")
      .lean();

    const orgUserIds = Array.from(new Set(forms.map((f: any) => String(f.userId)))).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const prefs = await Preferences.find({ userId: { $in: orgUserIds } })
      .select("userId logo name")
      .lean();

    const prefByUser: Record<string, { logo: string | null; name: string | null }> = {};
    prefs.forEach((p: any) => {
      prefByUser[String(p.userId)] = { logo: p.logo || null, name: p.name || null };
    });

    const formById: Record<string, { title: string; userId: string }> = {};
    forms.forEach((f: any) => {
      formById[String(f._id)] = { title: f.title, userId: String(f.userId) };
    });

    const payload = responses.map((r) => {
      const f = formById[String(r.formId)] || { title: "", userId: "" };
      const org = prefByUser[f.userId] || { logo: null, name: null };
      return {
        id: String(r._id),
        formId: String(r.formId),
        formTitle: f.title,
        organizationName: org.name,
        organizationLogo: org.logo,
        submittedAt: (r as any).createdAt as Date,
      };
    });

    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/client/submissions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
