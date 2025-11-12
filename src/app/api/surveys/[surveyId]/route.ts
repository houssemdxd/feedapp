import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Survey from "@/models/Survey";

export async function DELETE(
  _req: Request,
  { params }: { params: { surveyId: string } }
) {
  await connectDB();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "organization") {
    return NextResponse.json(
      { error: "Only organization accounts can delete surveys." },
      { status: 403 }
    );
  }

  const { surveyId } = params;
  if (!surveyId || !mongoose.Types.ObjectId.isValid(surveyId)) {
    return NextResponse.json({ error: "Invalid survey id." }, { status: 400 });
  }

  const survey = await Survey.findById(surveyId);
  if (!survey) {
    return NextResponse.json({ error: "Survey not found." }, { status: 404 });
  }

  if (String(survey.organizationId) !== String(currentUser._id)) {
    return NextResponse.json(
      { error: "You do not have permission to delete this survey." },
      { status: 403 }
    );
  }

  await survey.deleteOne();

  return NextResponse.json({ success: true });
}


