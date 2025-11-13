import { cookies } from "next/headers";

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setSessionCookie(token: string) {
  // 2 hours in seconds (match jwt "2h")
  (await
    // 2 hours in seconds (match jwt "2h")
    cookies()).set("session", token, { ...base, maxAge: 60 * 60 * 2 });
}

export async function clearSessionCookie() {
  (await cookies()).set("session", "", { ...base, maxAge: 0 });
}
