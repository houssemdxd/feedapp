// src/app/api/profile/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { verifyAccessToken } from "@/lib/jwt";
// import { query } from "@/lib/mysql";
// import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// // simple email validator (good enough)
// const emailOk = (e: string) =>
//   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());

// // Row types for SELECTs
// type DbUserRow = RowDataPacket & {
//   id: number;
//   email: string;
//   fname: string;
//   lname: string;
//   role: "client" | "organization";
// };

// type CountRow = RowDataPacket & { c: number };

// export async function PATCH(req: NextRequest) {
//   try {
//     // 1) auth via cookie + JWT
//     const token = (await cookies()).get("session")?.value;
//     if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const payload = await verifyAccessToken<{ userId: string }>(token);
//     if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     // 2) parse + validate body
//     const body = await req.json().catch(() => ({}));
//     let { fname, lname, email } = body as { fname?: string; lname?: string; email?: string };

//     fname = (fname ?? "").trim();
//     lname = (lname ?? "").trim();
//     email = (email ?? "").trim().toLowerCase();

//     if (!fname || !lname || !email) {
//       return NextResponse.json(
//         { error: "fname, lname and email are required" },
//         { status: 400 }
//       );
//     }
//     if (!emailOk(email)) {
//       return NextResponse.json({ error: "Invalid email" }, { status: 400 });
//     }

//     const userId = Number(payload.userId);

//     // 3) ensure email uniqueness among other users
//     const [existsRows] = await query<CountRow[]>(
//       "SELECT COUNT(*) AS c FROM users WHERE email = ? AND id <> ?",
//       [email, userId]
//     );
//     if ((existsRows[0]?.c ?? 0) > 0) {
//       return NextResponse.json({ error: "Email already in use" }, { status: 409 });
//     }

//     // 4) update allowed fields
//     await query<ResultSetHeader>(
//       "UPDATE users SET fname = ?, lname = ?, email = ? WHERE id = ?",
//       [fname, lname, email, userId]
//     );

//     // 5) return updated user
//     const [rows] = await query<DbUserRow[]>(
//       "SELECT id, email, fname, lname, role FROM users WHERE id = ? LIMIT 1",
//       [userId]
//     );
//     const u = rows[0];
//     if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     return NextResponse.json({
//       user: {
//         _id: String(u.id),
//         email: u.email,
//         fname: u.fname ?? "",
//         lname: u.lname ?? "",
//         role: u.role ?? "client",
//       },
//     });
//   } catch (err) {
//     console.error("PATCH /api/profile error:", err);
//     return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     const token = (await cookies()).get("session")?.value;
//     if (!token) return NextResponse.json({ user: null });

//     const payload = await verifyAccessToken<{ userId: string }>(token);
//     if (!payload?.userId) return NextResponse.json({ user: null });

//     const [rows] = await query<DbUserRow[]>(
//       "SELECT id, email, fname, lname, role FROM users WHERE id = ? LIMIT 1",
//       [Number(payload.userId)]
//     );
//     const u = rows[0];
//     if (!u) return NextResponse.json({ user: null });

//     return NextResponse.json({
//       user: {
//         _id: String(u.id),
//         email: u.email,
//         fname: u.fname ?? "",
//         lname: u.lname ?? "",
//         role: u.role ?? "client",
//       },
//     });
//   } catch (err) {
//     console.error("GET /api/profile error:", err);
//     return NextResponse.json({ user: null });
//   }
// }


// src/app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ---------- helpers ----------
const emailOk = (email: string) => /^\S+@\S+\.\S+$/.test(email.trim().toLowerCase());

const trimOrNull = (v: unknown) =>
  typeof v === "string" ? (v.trim() ? v.trim() : null) : null;

const upcase2OrNull = (v: unknown) => {
  if (typeof v !== "string") return null;
  const s = v.trim().toUpperCase();
  return s.length === 2 ? s : null;
};

// ---------- PATCH: partial update (role & image are NOT updatable here) ----------
export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken<{ userId: string }>(token);
    if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Partial<{
      fname: string;
      lname: string;
      userName: string;
      email: string;
      password: string;
      phone: string;      // <-- added
      bio: string;
      country: string;    // ISO-2 preferred (we upper it)
      city: string;
      postalCode: string;
      // not allowed here:
      role: string;
      image: string;
    }>;

    // Enforce immutable-in-this-endpoint constraints
    if ("role" in body) {
      return NextResponse.json({ error: "Role cannot be updated via this endpoint." }, { status: 403 });
    }
    if ("image" in body) {
      return NextResponse.json({ error: "Image cannot be updated here. Use the upload endpoint instead." }, { status: 403 });
    }

    // Build dynamic $set with only provided fields
    const $set: Record<string, any> = {};

    if ("fname" in body) $set.fname = trimOrNull(body.fname);
    if ("lname" in body) $set.lname = trimOrNull(body.lname);
    if ("userName" in body) $set.userName = trimOrNull(body.userName);

    if ("email" in body) {
      const email = (body.email ?? "").trim().toLowerCase();
      if (email && !emailOk(email)) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }
      if (email) {
        await connectDB();
        const exists = await User.exists({ email, _id: { $ne: payload.userId } });
        if (exists) {
          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
        $set.email = email;
      }
      // If you want to allow clearing email, you could also set null when empty.
    }

    if ("password" in body) {
      const pwd = (body.password ?? "").trim();
      if (pwd) $set.password = await bcrypt.hash(pwd, 12);
    }

    if ("phone" in body)      $set.phone = trimOrNull(body.phone); // <-- added
    if ("bio" in body)        $set.bio = trimOrNull(body.bio);
    if ("city" in body)       $set.city = trimOrNull(body.city);
    if ("postalCode" in body) $set.postalCode = trimOrNull(body.postalCode);
    if ("country" in body)    $set.country = trimOrNull(body.country);
    console.log("country in body is ::::",body.country);
    console.log("country ....:",$set.country);

    if (Object.keys($set).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await connectDB();
    const updated = await User.findByIdAndUpdate(
      payload.userId,
      { $set },
      {
        new: true,
        projection:
          "_id email fname lname userName role phone bio country city postalCode image",
      }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        _id: String(updated._id),
        email: updated.email ?? "",
        fname: updated.fname ?? "",
        lname: updated.lname ?? "",
        userName: updated.userName ?? "",
        role: updated.role ?? "client",
        phone: updated.phone ?? null,
        bio: updated.bio ?? null,
        country: updated.country ?? null,
        city: updated.city ?? null,
        postalCode: updated.postalCode ?? null,
        image: updated.image ?? null,
      },
    });
  } catch (err) {
    console.error("PATCH /api/auth/profile error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ---------- GET: return all fields needed by UI ----------
export async function GET() {
  try {
    const token = (await cookies()).get("session")?.value;
    if (!token) return NextResponse.json({ user: null });

    const payload = await verifyAccessToken<{ userId: string }>(token);
    if (!payload?.userId) return NextResponse.json({ user: null });

    await connectDB();
    const u = await User.findById(payload.userId)
      .select("_id email fname lname userName role phone bio country city postalCode image") // <-- phone included
      .lean();

    if (!u) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        _id: String(u._id),
        email: u.email ?? "",
        fname: u.fname ?? "",
        lname: u.lname ?? "",
        userName: u.userName ?? "",
        role: u.role ?? "client",
        phone: u.phone ?? null,
        bio: u.bio ?? null,
        country: u.country ?? null,
        city: u.city ?? null,
        postalCode: u.postalCode ?? null,
        image: u.image ?? null,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/profile error:", err);
    return NextResponse.json({ user: null });
  }
}
