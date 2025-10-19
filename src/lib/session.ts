

 import { cookies } from "next/headers";
 import { verifyAccessToken } from "@/lib/jwt";
 import { connectDB } from "@/lib/mongodb";
 import User from "@/models/User";

 export async function getCurrentUser() {
   const token = (await cookies()).get("session")?.value;
   if (!token) return null;

   const payload = await verifyAccessToken<{ userId: string }>(token);
   if (!payload?.userId) return null;
   await connectDB();
   const user = await User.findById(payload.userId)
     .select("_id email fname lname role")
     .lean();

   if (!user) return null;
   return {
     _id: String(user._id),
     email: user.email,
    fname: user.fname,
     lname: user.lname,
     role: user.role ?? "client",
   };
 }
