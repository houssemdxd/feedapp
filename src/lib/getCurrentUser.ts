import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookies().toString() },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch (err) {
    console.error("❌ Failed to fetch user:", err);
    return null;
  }
}
