/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */


// src/app/api/auth/login/route.ts

//js file !!!!!!!!!!!!!!!!!!!!!!!!!!!
 import { connectDB } from "@/lib/mongodb";
 import User from "@/models/User";
import bcrypt from "bcryptjs"; import jwt from "jsonwebtoken";
 import { signAccessToken } from "@/lib/jwt";
 import { setSessionCookie } from "@/lib/cookies";


 export async function POST(req: { json: () => PromiseLike<{ email: any; password: any; }> | { email: any; password: any; }; }) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });

  //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
   const token = signAccessToken({ userId: String(user._id) });
  await setSessionCookie(await token);

  return new Response(JSON.stringify({ token }), { status: 200 });
 }
