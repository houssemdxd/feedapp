// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmailVerificationToken from "@/models/EmailVerificationToken";
import User from "@/models/User";
import { hashToken } from "@/lib/crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function toSignin(q: string) {
  return `${APP_URL}/signin?${q}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(toSignin("verified=missing"));
    }

    const tokenHash = hashToken(token);
    const doc = await EmailVerificationToken.findOne({ tokenHash });

    if (!doc) {
      return NextResponse.redirect(toSignin("verified=invalid"));
    }

    if (doc.expiresAt < new Date()) {
      await EmailVerificationToken.deleteOne({ _id: doc._id });
      return NextResponse.redirect(toSignin("verified=expired"));
    }

    // Mark verified & cleanup
    await User.updateOne(
      { _id: doc.userId },
      { $set: { emailVerified: new Date() } }
    );
    await EmailVerificationToken.deleteOne({ _id: doc._id });

    return NextResponse.redirect(toSignin("verified=success"));
  } catch (e) {
    console.error("/api/auth/verify error:", e);
    return NextResponse.redirect(toSignin("verified=error"));
  }
}
