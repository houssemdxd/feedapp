// import { NextResponse } from "next/server";
// import { clearSessionCookie } from "@/lib/cookies";

// export async function POST() {
//   clearSessionCookie();
//   return NextResponse.json({ ok: true });
// }
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "session", value: "", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return res;
}
