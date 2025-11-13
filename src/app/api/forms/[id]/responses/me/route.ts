import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import FormResponse from "@/models/FormResponse";
import { getCurrentUser } from "@/lib/session";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user?._id) {
      // Not authenticated: cannot assert duplicate on server side
      return NextResponse.json({ submitted: false });
    }
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
    }

    const exists = await FormResponse.exists({
      formId: new mongoose.Types.ObjectId(id),
      respondentId: new mongoose.Types.ObjectId(user._id),
    });

    return NextResponse.json({ submitted: !!exists });
  } catch (err) {
    console.error("GET /api/forms/[id]/responses/me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
