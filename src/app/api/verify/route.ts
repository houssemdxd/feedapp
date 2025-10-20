import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Preferences from "@/models/Preferences";

export async function POST(req: Request) {
  await connectDB();
  const { code } = await req.json();

  if (!code) return NextResponse.json({ message: "Code manquant" }, { status: 400 });

  const user = await User.findOne({ generatedCode: code });
  if (!user) return NextResponse.json({ message: "Code invalide" }, { status: 404 });

  const preferences = await Preferences.findOne({ userId: user._id });
  if (!preferences) return NextResponse.json({ message: "Aucune préférence trouvée" }, { status: 404 });

  return NextResponse.json({ success: true, preferences });
}
