import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const protectedPrefixes = ["/(admin)"]; // add more if needed
  const isProtected = protectedPrefixes.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    return NextResponse.next();
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/(admin)(.*)"],
};
