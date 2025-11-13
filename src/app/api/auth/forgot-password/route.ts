import { NextResponse } from "next/server";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { generateToken, hashToken } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { connectDB } from "@/lib/mongodb";


const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const RESET_TOKEN_TTL_MIN = Number(process.env.RESET_TOKEN_TTL_MIN || 60);

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email } = await req.json();
        if (!email || typeof email !== "string") {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }
        // Always respond the same to avoid enumeration
        const genericOk = NextResponse.json({ message: "If that email exists, a reset link has been sent." });

        const user = await User.findOne({ email }).select({ _id: 1 });
        if (!user) return genericOk;

        await PasswordResetToken.deleteMany({ userId: user._id });

        const rawToken = generateToken(32);
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60 * 1000);

        await PasswordResetToken.create({ tokenHash, userId: user._id, expiresAt });

        const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
        try { await sendPasswordResetEmail(email, resetUrl); } catch (e) { console.error("Mail error", e); }

        return genericOk;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
    }
}