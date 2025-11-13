// app/not-found.tsx
import GridShape from "@/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

type Role = "client" | "organization";

async function getMeWithCookies(cookieHeader: string) {
  // Use absolute URL to avoid edge cases; you can also use a relative URL
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/auth/me`, {
    method: "GET",
    // Forward cookies so the API sees the session
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ?? null;
}

export default async function NotFound() {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const user = await getMeWithCookies(cookieHeader);

  const homeHref =
    user?.role === "organization" ? "/admin" :
    user?.role === "client"       ? "/client" :
                                    "/signin";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          ERROR
        </h1>

        <Image src="/images/error/404.svg" alt="404" className="dark:hidden" width={472} height={152} />
        <Image src="/images/error/404-dark.svg" alt="404" className="hidden dark:block" width={472} height={152} />

        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          We can’t seem to find the page you are looking for!
        </p>

        <Link
          href={homeHref}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Back to Home Page
        </Link>
      </div>

      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - TailAdmin
      </p>
    </div>
  );
}
