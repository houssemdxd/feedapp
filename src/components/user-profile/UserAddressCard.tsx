"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import CountrySelect from "../form/formatted-countries";
import StateSelect from "../form/StateSelect";

// ---- Types ----
type SessionUser = {
  _id: string;
  email: string;
  fname: string;
  lname: string;
  role: "client" | "organization";
  country?: string | null;    // ISO-2 preferred, but API will normalize
  city?: string | null;
  postalCode?: string | null;
};
type MeResponse = { user: SessionUser | null };

// ---- Small skeletons ----
function LineSkeleton({ width = "12ch" }: { width?: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-4 rounded bg-gray-100 dark:bg-white/10 animate-pulse"
      style={{ width }}
    />
  );
}
function BlockSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            <LineSkeleton width="10ch" />
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            <LineSkeleton width="20ch" />
          </p>
        </div>
      ))}
    </div>
  );
}

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();

  // fetched user + loading state
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // modal form state
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // load current user (reads address fields via /api/auth/me)
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
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // display values with fallbacks
  const display = useMemo(() => {
    const u = user;
    return {
      country: (u?.country ?? "").trim() || "—",
      city: (u?.city ?? "").trim() || "—",
      postalCode: (u?.postalCode ?? "").trim() || "—",
    };
  }, [user]);

  // open modal & prime form fields
  const handleOpenModal = () => {
    setCountry(display.country === "—" ? "" : display.country);
    setCity(display.city === "—" ? "" : display.city);
    setPostalCode(display.postalCode === "—" ? "" : display.postalCode);
    openModal();
  };

  // save changes through /api/auth/profile (role/image not updatable here)
  const handleSave = async () => {
    // country is normalized server-side to ISO-2; we still uppercase to help the user
    const payload = {
      country: country || null,
      city: city || null,
      postalCode: postalCode || null,
    };
    console.log("country ::::", payload.country);
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("country seted!!!!!!!!!!!!!!!!");
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? "Failed to save");
      return;
    }

    const j = (await res.json()) as { user: SessionUser };
    // optimistic local update
    setUser((prev) => {
      const base: SessionUser =
        prev ?? {
          _id: j.user._id,
          email: j.user.email,
          fname: j.user.fname,
          lname: j.user.lname,
          role: j.user.role,
        };
      return {
        ...base,
        country: j.user.country ?? null,
        city: j.user.city ?? null,
        postalCode: j.user.postalCode ?? null,
      };
    });

    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Address
            </h4>

            {loading ? (
              <BlockSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Country
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {display.country}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    City/State
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {display.city}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Postal Code
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {display.postalCode}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto disabled:opacity-60"
            disabled={loading}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Address
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your address details.
            </p>
          </div>

          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="px-2 overflow-y-auto custom-scrollbar h-[300px]">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">

                <div>
                  <Label>Country (ISO-2 preferred)</Label>
                  <CountrySelect value={country} onChange={setCountry} />
                </div>

                <div>
                  <Label>City/State</Label>
                 
                  <StateSelect
                    country={country}   // pass the country string you already have (name OR code)
                    value={city}
                    onChange={setCity}
                  />
                </div>

                <div>
                  <Label>Postal Code</Label>
                  <Input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="85001"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" type="button" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
