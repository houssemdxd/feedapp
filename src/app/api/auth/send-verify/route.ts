// app/api/auth/send-verify/route.ts
import { NextResponse } from "next/server";
import User from "@/models/User";
import EmailVerificationToken from "@/models/EmailVerificationToken";
import { connectDB } from "@/lib/mongodb";
import { generateToken, hashToken } from "@/lib/crypto";
import { sendVerificationEmail } from "@/lib/mailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const VERIFY_TOKEN_TTL_MIN = Number(process.env.VERIFY_TOKEN_TTL_MIN || 15);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Always generic to avoid enumeration
    const genericOk = NextResponse.json({ message: "If that email exists, a verification link has been sent." });

    const user = await User.findOne({ email }).select({ _id: 1, emailVerified: 1 });
    if (!user) return genericOk;

    // If already verified, still respond OK without sending anything
    if (user.emailVerified) return genericOk;

    // One active token per user
    await EmailVerificationToken.deleteMany({ userId: user._id });

    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MIN * 60 * 1000);

    await EmailVerificationToken.create({ tokenHash, userId: user._id, expiresAt });

    const verifyUrl = `${APP_URL}/api/auth/verify?token=${rawToken}`;
    try { await sendVerificationEmail(email, verifyUrl); } catch (e) { console.error("Mail error", e); }

    return genericOk;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
