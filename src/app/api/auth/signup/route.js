import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();
  const { fname, lname, email, password } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ error: "Email already exists" }), { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ fname, lname, email, password: hashedPassword });

  return new Response(JSON.stringify({ message: "User created", userId: user._id }), { status: 201 });
}
