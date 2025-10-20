/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getFormQuestionsById } from "@/app/actions/formActions";

// ✅ Define the context type separately for clarity
interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = context.params;

  try {
    const questions = await getFormQuestionsById(id);
    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    console.error("❌ Error in [id]/route.ts GET:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
