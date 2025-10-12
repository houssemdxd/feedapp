// src/components/profile/UserInfoCard.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

// -------- Types --------
type SessionUser = {
  _id: string;
  email: string;
  fname: string;
  lname: string;
  role: "client" | "organization";
  // Optional extended fields (fallbacks provided below)
  phone?: string;
  bio?: string;
};
type MeResponse = { user: SessionUser | null };

// -------- Small skeletons for smooth loading --------
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
      {Array.from({ length: 5 }).map((_, i) => (
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

// -------- Component --------
export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();

  // fetched user + loading state
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // local form state (used inside modal)
  const [firstName, setFirstName] = useState("Musharof");
  const [lastName, setLastName] = useState("Chowdhury");
  const [email, setEmail] = useState("randomuser@pimjo.com");
  const [phone, setPhone] = useState("+09 363 398 46");
  const [bio, setBio] = useState("Team Manager");
  const [facebook, setFacebook] = useState("https://www.facebook.com/PimjoHQ");
  const [xcom, setXcom] = useState("https://x.com/PimjoHQ");
  const [linkedin, setLinkedin] = useState("https://www.linkedin.com/company/pimjo");
  const [instagram, setInstagram] = useState("https://instagram.com/PimjoHQ");

  // fetch current user once on mount
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

  // display values (fallback to static if undefined)
  const display = useMemo(() => {
    const u = user;
    return {
      fname: u?.fname?.trim() || "Musharof",
      lname: u?.lname?.trim() || "Chowdhury",
      email: u?.email?.trim() || "randomuser@pimjo.com",
      phone: u?.phone?.trim() || "+09 363 398 46",
      bio: u?.bio?.trim() || "Team Manager",
    };
  }, [user]);

  // when opening the modal, prime the form fields from current display values
  const handleOpenModal = () => {
    setFirstName(display.fname);
    setLastName(display.lname);
    setEmail(display.email);
    setPhone(display.phone);
    setBio(display.bio);

    // keep socials as-is (static defaults) — update these if you store them in DB later
    openModal();
  };

  // Save action (stub): wire this to your real API later
  const handleSave = async () => {
    // Example payload you might send to your API:
    // await fetch("/api/profile", { method: "POST", body: JSON.stringify({ firstName, lastName, email, phone, bio, facebook, xcom, linkedin, instagram })})

    // Optimistically update the visible card immediately
    setUser((prev) => {
      const base: SessionUser =
        prev ?? {
          _id: "static-id",
          email,
          fname: firstName,
          lname: lastName,
          role: "client",
          phone,
          bio,
        };
      return {
        ...base,
        email,
        fname: firstName,
        lname: lastName,
        phone,
        bio,
      };
    });

    closeModal();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          {loading ? (
            <BlockSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  First Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {display.fname}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Last Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {display.lname}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {display.email}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {display.phone}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Bio
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {display.bio}
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

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input type="text" value={xcom} onChange={(e) => setXcom(e.target.value)} />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input type="text" value={bio} onChange={(e) => setBio(e.target.value)} />
                  </div>
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
    </div>
  );
}
