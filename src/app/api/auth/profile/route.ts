/* eslint-disable no-var */


 // src/app/api/profile/route.ts
 import { NextRequest, NextResponse } from "next/server";
 import { cookies } from "next/headers";
 import { verifyAccessToken } from "@/lib/jwt";
  import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

 // simple email validator (good enough)
 const emailOk = (e: string) =>
   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());

 export async function PATCH(req: NextRequest) {
   try {
     const token = (await cookies()).get("session")?.value;
     if (!token) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
     const payload = await verifyAccessToken<{ userId: string }>(token);
     if (!payload?.userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

    const body = await req.json().catch(() => ({}));
     let { fname, lname, email } = body as {
       fname?: string;
       lname?: string;
       email?: string;
     };

    fname = (fname ?? "").trim();
     lname = (lname ?? "").trim();
     email = (email ?? "").trim().toLowerCase();

    if (!fname || !lname || !email) {
       return NextResponse.json(
         { error: "fname, lname and email are required" },
         { status: 400 }       );
    }
    if (!emailOk(email)) {
       return NextResponse.json({ error: "Invalid email" }, { status: 400 });
     }

     await connectDB();
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     var a :any ;
    const emailInUse = await User.exists({
       email,
       _id: { $ne: payload.userId },
     });
     if (emailInUse) {
       return NextResponse.json(
         { error: "Email already in use" },
         { status: 409 }
       );
     }

    const updated = await User.findByIdAndUpdate(
       payload.userId,
       { $set: { fname, lname, email } },
       { new: true, projection: "_id email fname lname role" },
       a
    ).lean();

     if (!updated) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
     }

     return NextResponse.json({
       user: {
         _id: String(updated._id),
         email: updated.email,
         fname: updated.fname ?? "",
         lname: updated.lname ?? "",
         role: updated.role ?? "client",
       },
     });   } catch (err) {
     console.error("PATCH /api/profile error:", err);
     return NextResponse.json(
       { error: "Something went wrong" },
       { status: 500 }
     );
   }
 }





// export async function GET() {
//   const token = (await cookies()).get("session")?.value;
//   if (!token) return NextResponse.json({ user: null });

//   const payload = await verifyAccessToken<{ userId: string }>(token);
//   if (!payload?.userId) return NextResponse.json({ user: null });

//   await connectDB();
//   const user = await User.findById(payload.userId)
//     .select("_id email fname lname role")
//     .lean();

//   if (!user) return NextResponse.json({ user: null });

//   return NextResponse.json({
//     user: {
//       _id: String(user._id),
//       email: user.email,
//       fname: user.fname ?? "",
//       lname: user.lname ?? "",
//       role: user.role ?? "client",
//     },
//   });
// }
