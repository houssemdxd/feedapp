//lib/session.ts
// src/lib/session.ts
// import { cookies } from "next/headers";
// import { verifyAccessToken } from "@/lib/jwt";
// import { query } from "@/lib/mysql";
// import type { RowDataPacket } from "mysql2/promise";

// type DbUserRow = RowDataPacket & {
//   id: number;
//   email: string;
//   fname: string;
//   lname: string;
//   role: "client" | "organization";
// };

// export async function getCurrentUser() {
//   const token = (await cookies()).get("session")?.value;
//   if (!token) return null;

//   const payload = await verifyAccessToken<{ userId: string }>(token);
//   if (!payload?.userId) return null;

//   const [rows] = await query<DbUserRow[]>(
//     "SELECT id, email, fname, lname, role FROM users WHERE id = ? LIMIT 1",
//     [Number(payload.userId)]
//   );
//   const u = rows[0];
//   if (!u) return null;

//   return {
//     _id: String(u.id),       // keep _id string for compatibility with old code
//     email: u.email,
//     fname: u.fname ?? "",
//     lname: u.lname ?? "",
//     role: u.role ?? "client",
//   };
// }

// /** Optional: throws if not authenticated (handy in server components) */
// export async function requireCurrentUser() {
//   const u = await getCurrentUser();
//   if (!u) throw new Error("Unauthorized");
//   return u;
// }

import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function getCurrentUser() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;

  const payload = await verifyAccessToken<{ userId: string, role: string, }>(token);
  if (!payload?.userId && !payload?.role) return null;

  await connectDB();
  const user = await User.findById(payload.userId)
    .select("_id email fname lname role bio image country postalCode city userName phone")
    .lean();

  if (!user) return null;
  return {
    _id: String(user._id),
    email: user.email,
    fname: user.fname,
    lname: user.lname,
    role: user.role ?? "client",
    bio: user.bio ?? "none",
    phone: user.phone ?? "none",
    country: user.country ?? "none",
    postalCode: user.postalCode ?? "none",
    city: user.city ?? "none",
    image: user.image ?? "/images/user/user-05.jpg",
    userName: user.userName ?? "none",
  };
}
