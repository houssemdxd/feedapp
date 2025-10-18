

// src/app/api/auth/login/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import User from "@/models/User";               // <-- your MySQL repo version
// import { signAccessToken } from "@/lib/jwt";
// import { setSessionCookie } from "@/lib/cookies";

// type LoginBody = { email?: string; password?: string };

// export async function POST(req: NextRequest) {
//   try {
//     const { email, password } = (await req.json()) as LoginBody;

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required" },
//         { status: 400 }
//       );
//     }

//     // find user by email (MySQL repo)
//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return NextResponse.json(
//         { error: "Invalid email or password" },
//         { status: 401 }
//       );
//     }

//     // compare password
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) {
//       return NextResponse.json(
//         { error: "Invalid email or password" },
//         { status: 401 }
//       );
//     }

//     // sign jwt and set cookie
//     const token = await signAccessToken({ userId: String(user.id) });
//     await setSessionCookie(token);

//     // (return token + minimal user if you want)
//     return NextResponse.json({
//       token,
//       user: {
//         _id: user._id,              // string mirror of id
//         email: user.email,
//         fname: user.fname,
//         lname: user.lname,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("POST /api/auth/login error:", err);
//     return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
//   }
// }
//js file !!!!!!!!!!!!!!!!!!!!!!!!!!!
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
import { signAccessToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";


export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });

  //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const token = signAccessToken({ userId: String(user._id) });
  await setSessionCookie(token);

  return new Response(JSON.stringify({ token }), { status: 200 });
}
