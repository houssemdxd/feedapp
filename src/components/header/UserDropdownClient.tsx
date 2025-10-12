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

function initials(u: NonNullable<SessionUser>) {
  const a = u.fname?.[0] ?? "";
  const b = u.lname?.[0] ?? "";
  return (a + b || u.email?.[0] || "?").toUpperCase();
}

type MeResponse = { user: SessionUser | null }; // shape your /api/auth/me returns

export default function UserDropdown({ user }: { user: SessionUser | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userState, setUserState] = useState<SessionUser | null>(user);
  const router = useRouter();

  // If no user was provided, fetch it on the client
  useEffect(() => {
    if (userState !== null) return;
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
        if (!cancelled) setUserState(data?.user ?? null);
      } catch {
        // swallow
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userState]);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }
  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.replace("/signin");
    }
  }

  const displayName = userState ? `${userState.fname} ${userState.lname}`.trim() : "Guest";
  const email = userState?.email ?? "—";
  const imageSrc: string | null = null;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 grid place-items-center bg-gray-100 dark:bg-white/10">
          {imageSrc ? (
            <Image width={44} height={44} src={imageSrc} alt="User" />
          ) : (
            <span className="text-sm font-semibold text-gray-700 dark:text-white">
              {userState ? initials(userState) : "?"}
            </span>
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {displayName || email}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {displayName || email}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
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
