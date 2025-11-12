import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Preferences from "@/models/Preferences";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { code } = await req.json();

    if (!code) return NextResponse.json({ message: "Code manquant" }, { status: 400 });

    const user = await User.findOne({ generatedCode: code }).select("_id generatedCode").lean();
    if (!user) return NextResponse.json({ message: "Code invalide" }, { status: 404 });

    const preferences = await Preferences.findOne({ userId: user._id }).lean();
    if (!preferences) return NextResponse.json({ message: "Aucune préférence trouvée" }, { status: 404 });

    const res = NextResponse.json({
      success: true,
      preferences,
      orgUserId: String(user._id),
      organization: { name: (preferences as any).name ?? null, logo: (preferences as any).logo ?? null },
    });
    // Set a short-lived cookie to grant access to /organization regardless of auth role
    res.cookies.set("org_access", String(user._id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 30, // 30 minutes
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    console.error("/api/verify error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
