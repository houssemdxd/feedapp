// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || "secretkey");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, secret); // throws if invalid/expired
    return NextResponse.next();
  } catch {
    const url = new URL("/signin", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

// Protect these URL paths:
export const config = {
  matcher: [
    "/(admin)(.*)",      
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
};
