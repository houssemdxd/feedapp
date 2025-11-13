
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
import { signAccessToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";


export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    if (!user.emailVerified) {
      return new Response(JSON.stringify({ message: "Email not verified. Please check your email." }), { status: 403 });
    }
    //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const token = signAccessToken({ userId: String(user._id), role: String(user.role) });
    await setSessionCookie(token);

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (err) {
    console.error("/api/auth/login error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
