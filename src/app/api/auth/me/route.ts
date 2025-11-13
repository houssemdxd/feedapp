
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  console.log("getting usr .......................")
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = await verifyAccessToken<{ userId: string }>(token);
  if (!payload?.userId) {
    return NextResponse.json({ user: null });
  }

  await connectDB();
  const user = await User.findById(payload.userId)
    .select("_id email fname lname role bio image country postalCode city userName phone emailVerified")
    .lean();
  console.log("user :", user);

  if (!user) {
    return NextResponse.json({ user: null });
  }

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
    image: user.image ?? "/images/user/user-05.jpg",
    userName: user.userName ?? "none",
    emailVerified: user.emailVerified,
    },
  });
}