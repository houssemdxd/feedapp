// import { cookies } from "next/headers";
// import { verifyAccessToken } from "@/lib/jwt";
// import { connectDB } from "@/lib/mongodb";
// import User from "@/models/User";

// export type SessionUser = {
//   _id: string;
//   email: string;
//   fname: string;
//   lname: string;
//   role: "client" | "organization";
// };

// export async function getSessionApp(): Promise<SessionUser | null> {
//   const token = (await cookies()).get("session")?.value;
//   if (!token) return null;

//   try {
//     const { userId } = verifyAccessToken<{ userId: string }>(token);
//     await connectDB();
//     const u = await User.findById(userId)
//       .select("_id email fname lname role")
//       .lean();
//     return u
//       ? { _id: String(u._id), email: u.email, fname: u.fname, lname: u.lname, role: u.role }
//       : null;
//   } catch {
//     return null;
//   }
// }
