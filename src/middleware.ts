// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || "secretkey");

type Role = "client" | "organization";
type User = { userId?: string; role?: Role } & JWTPayload;

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
const GUEST_ONLY = [/^\/signin$/, /^\/signup$/, /^\/forgot-password$/];
const PUBLIC = [/^\/$/, /^\/pricing$/, /^\/about$/];

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

function serveRole404(req: NextRequest, opts: { expectedRole: Role; backHref: string; from?: string }) {
  const url = new URL("/not-found", req.url);
  if (opts.from) url.searchParams.set("from", opts.from);

  const res = NextResponse.rewrite(url);
  res.cookies.set("role_mismatch", JSON.stringify(opts), {
    path: "/",
    maxAge: 10,
    httpOnly: false,
    sameSite: "lax",
  });
  return res;
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
  const orgAccess = req.cookies.get("org_access")?.value;

  if (matchAny(pathname, GUEST_ONLY)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
    }
    return NextResponse.next();
  }

  if (matchAny(pathname, PUBLIC)) {
    return NextResponse.next();
  }

  if (matchAny(pathname, CLIENT_ONLY)) {
    if (!isAuthenticated) return redirectWithNext("/signin", req);
    if (role !== "client") {
      return serveRole404(req, { expectedRole: "client", backHref: roleHome(role), from: "client" });
    }
    return NextResponse.next();
  }

  if (matchAny(pathname, ORG_ONLY)) {
    if (orgAccess) return NextResponse.next();

    if (!isAuthenticated) return redirectWithNext("/signin", req);
    if (role !== "organization") {
      return serveRole404(req, { expectedRole: "organization", backHref: roleHome(role), from: "organization" });
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return redirectWithNext("/signin", req);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
