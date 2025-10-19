import { NextResponse } from "next/server";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { hashToken } from "@/lib/crypto";
import { hashPassword } from "@/lib/password";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { token, password } = await req.json();
        if (!token || typeof token !== "string") {
            return NextResponse.json({ message: "Token is required" }, { status: 400 });
        }
        if (!password || typeof password !== "string" || password.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
        }

        const tokenHash = hashToken(token);
        const rec = await PasswordResetToken.findOne({ tokenHash });
        if (!rec || rec.expiresAt < new Date()) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
        }

        const newHash = await hashPassword(password);
        await User.updateOne({ _id: rec.userId }, { $set: { password: newHash } });
        await PasswordResetToken.deleteMany({ userId: rec.userId });

        return NextResponse.json({ message: "Password has been reset successfully" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
    }
}