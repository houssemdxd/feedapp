import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  return new Response(JSON.stringify({ token }), { status: 200 });
}
