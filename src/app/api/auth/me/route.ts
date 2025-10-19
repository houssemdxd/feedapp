
 import { NextResponse } from "next/server";
 import { cookies } from "next/headers";
 import { verifyAccessToken } from "@/lib/jwt";
 import { connectDB } from "@/lib/mongodb";
 import User from "@/models/User";

 export async function GET() {
   console.log("getting usr .......................")
  // 1️⃣ Get the "session" cookie value
  const token = (await cookies()).get("session")?.value;
  if (!token) {
     return NextResponse.json({ user: null });
   }

  // 2️⃣ Verify the JWT
  const payload = await verifyAccessToken<{ userId: string }>(token);
  if (!payload?.userId) {
    return NextResponse.json({ user: null });
  }

   // 3️⃣ Load user from MongoDB
   await connectDB();
   const user = await User.findById(payload.userId)
     .select("_id email fname lname role")
     .lean();
     console.log("fucking y=user :", user );

   if (!user) {
     return NextResponse.json({ user: null });
   }

   // 4️⃣ Return user info
   return NextResponse.json({
     user: {
       _id: String(user._id),
       email: user.email,
       fname: user.fname,
       lname: user.lname,
       role: user.role ?? "client",
     },
   });
 }
