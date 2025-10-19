// src/components/nav/UserDropdownClient.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export type SessionUser = {
  _id: string;
  email: string;
  fname: string;
  lname: string;
  role: "client" | "organization";
};
type MeResponse = { user: SessionUser | null };

function initials(u: SessionUser) {
  const a = u.fname?.[0] ?? "";
  const b = u.lname?.[0] ?? "";
  const ab = (a + b).trim();
  return (ab || u.email?.[0] || "?").toUpperCase();
}

/** Simple shimmer skeleton circle */
function AvatarSkeleton() {
  return (
    <span
      aria-hidden
      className="mr-3 h-11 w-11 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10 relative"
    >
      <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-black/5 to-transparent dark:via-white/10" />
    </span>
  );
}

/** Text skeleton line */
function LineSkeleton({ width = "8ch" }: { width?: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-4 align-middle rounded bg-gray-100 dark:bg-white/10 animate-pulse"
      style={{ width }}
    />
  );
}

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  // small delay to smooth flicker when loading resolves very fast
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return;
        const data: MeResponse = await res.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          // Add a short delay so the fade-in feels smooth (150ms)
          setTimeout(() => !cancelled && setReady(true), 150);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.replace("/signin");
    }
  }

  const displayName = user ? `${user.fname} ${user.lname}`.trim() : "Guest";
  const email = user?.email ?? "—";
  const imageSrc: string | null = null;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        className={`flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle transition-opacity ${
          ready ? "opacity-100" : "opacity-95"
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-busy={loading}
        disabled={loading} // prevents opening while loading to avoid odd states
      >
        {/* Avatar */}
        {loading ? (
          <AvatarSkeleton />
        ) : (
          <span className="mr-3 overflow-hidden rounded-full h-11 w-11 grid place-items-center bg-gray-100 dark:bg-white/10">
            {imageSrc ? (
              <Image width={44} height={44} src={imageSrc} alt="User" />
            ) : (
              <span className="text-sm font-semibold text-gray-700 dark:text-white">
                {user ? initials(user) : "?"}
              </span>
            )}
          </span>
        )}

        {/* Name / email */}
        <span className="block mr-1 font-medium text-theme-sm">
          {loading ? <LineSkeleton width="10ch" /> : displayName || email}
        </span>

        {/* Caret */}
        <svg
          className={`ml-1 stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          aria-hidden
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen && !loading}
        onClose={() => setIsOpen(false)}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out"
      >
        <div className="mb-1">
          {loading ? (
            <>
              <LineSkeleton width="12ch" />
              <div className="mt-1">
                <LineSkeleton width="18ch" />
              </div>
            </>
          ) : (
            <>
              <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                {displayName || email}
              </span>
              <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                {email}
              </span>
            </>
          )}
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              tag="a"
              href="/admin/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              tag="a"
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg.white/5"
            >
              Account settings
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 w-full text-left"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
