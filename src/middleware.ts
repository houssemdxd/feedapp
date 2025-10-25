// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || "secretkey");

type Role = "client" | "organization";
type User = { userId?: string; role?: Role } & JWTPayload;

// ---- Route groups -----------------------------------------------------------
const CLIENT_ONLY = [
  /^\/dashboard(\/.*)?$/,
  /^\/profile(\/.*)?$/,
  /^\/client(\/.*)?$/,
  
];

const ORG_ONLY = [
  /^\/admin(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/organization(\/.*)?$/,
];

const GUEST_ONLY = [
  /^\/signin$/,
  /^\/signup$/,
  /^\/forgot-password$/,
];

const PUBLIC = [
  /^\/$/,               // make home public; move to a role group if needed
  /^\/pricing$/,
  /^\/about$/,
];
// -----------------------------------------------------------------------------

function matchAny(pathname: string, patterns: RegExp[]) {
  return patterns.some((re) => re.test(pathname));
}

function redirectWithNext(to: string, req: NextRequest) {
  const url = new URL(to, req.url);
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

function roleHome(role?: Role) {
  if (role === "organization") return "/admin";
  if (role === "client") return "/client";
  return "/";
}

async function readUserFromJWT(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as User;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals / static assets (middleware matcher is broad)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|map|txt|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const user = await readUserFromJWT(req);
  const isAuthenticated = !!user?.userId;
  const role = user?.role;

  // 1) Guest-only: block authenticated users
  if (matchAny(pathname, GUEST_ONLY)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
    }
    return NextResponse.next();
  }

  // 2) Public: always allow
  if (matchAny(pathname, PUBLIC)) {
    return NextResponse.next();
  }

  // 3) Client-only
  if (matchAny(pathname, CLIENT_ONLY)) {
    if (!isAuthenticated) return redirectWithNext("/signin", req);
    if (role !== "client") {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
      // or: return NextResponse.redirect(new URL("/403", req.url));
    }
    return NextResponse.next();
  }

  // 4) Organization-only
  if (matchAny(pathname, ORG_ONLY)) {
    if (!isAuthenticated) return redirectWithNext("/signin", req);
    if (role !== "organization") {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
      // or: return NextResponse.redirect(new URL("/403", req.url));
    }
    return NextResponse.next();
  }

  // 5) Default policy: require auth (or change to default-public if you prefer)
  if (!isAuthenticated) {
    return redirectWithNext("/signin", req);
  }
  return NextResponse.next();
}

export const config = {
  // Broad matcher; we still skip static/_next in code above.
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
