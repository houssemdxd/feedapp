import { NextRequest, NextResponse } from "next/server";
import { getFormQuestionsById } from "@/app/actions/formActions"; // your action to get questions

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const questions = await getFormQuestionsById(id); // fetch from DB
    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
