// src/app/api/auth/me/route.ts
// import { NextResponse } from "next/server";
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

// export async function GET() {
//   console.log("GET /api/auth/me -> reading session cookie...");
//   const token = (await cookies()).get("session")?.value; // no need for await
//   if (!token) return NextResponse.json({ user: null });

//   const payload = await verifyAccessToken<{ userId: string }>(token);
//   if (!payload?.userId) return NextResponse.json({ user: null });

//   const [rows] = await query<DbUserRow[]>(
//     "SELECT id, email, fname, lname, role FROM users WHERE id = ? LIMIT 1",
//     [Number(payload.userId)]
//   );
//   const u = rows[0];
//   console.log("user row:", u);

//   if (!u) return NextResponse.json({ user: null });

//   return NextResponse.json({
//     user: {
//       _id: String(u.id),     // keep _id for compatibility
//       email: u.email,
//       fname: u.fname ?? "",
//       lname: u.lname ?? "",
//       role: u.role ?? "client",
//     },
//   });
// }

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
    .select("_id email fname lname role bio image country postalCode city userName phone")
    .lean();
  console.log("fucking y=user :", user);

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
    bio: user.bio ?? "none",
    phone: user.phone ?? "none",
    country: user.country ?? "none",
    postalCode: user.postalCode ?? "none",
    city: user.city ?? "none",
    image: user.image ?? "/images/user/owner.jpg",
    userName: user.userName ?? "none",
    },
  });
}