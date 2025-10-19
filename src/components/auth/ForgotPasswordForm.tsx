"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";


export default function ForgotPasswordForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token");
  const isResetMode = Boolean(token);

  // Shared UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Request-reset state
  const [email, setEmail] = useState("");

  // New-password state (when token is present)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const onConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

  const validateEmail = (value: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNote(null);

    try {
      setLoading(true);

      if (!isResetMode) {
        // 1) Request reset link
        if (!email.trim()) throw new Error("Email is required");
        if (!validateEmail(email)) throw new Error("Please enter a valid email address");

        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to send reset link");

        setNote("If an account exists for that email, a reset link has been sent.");
      } else {
        // 2) Set a new password
        if (!password) throw new Error("Password is required");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        if (password !== confirmPassword) throw new Error("Passwords do not match");

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to reset password");

        setNote("✅ Your password has been updated. You can now sign in.");
        router.push("/signin");
        // Optional: redirect after a short delay
        // setTimeout(() => router.push("/signin"), 1200);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {isResetMode ? "Reset password" : "Forgot password"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isResetMode
              ? "Create a new password for your account."
              : "Enter the email associated with your account and we'll send you a reset link."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {!isResetMode ? (
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={onEmailChange}
                />
              </div>
            ) : (
              <>
                <div>
                  <Label>
                    New password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPwd ? "text" : "password"}
                      placeholder="Enter a new password"
                      value={password}
                      onChange={onPasswordChange}
                    />
                    <span
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowPwd((s) => !s)}
                    >
                      {showPwd ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use at least 8 characters.
                  </p>
                </div>

                <div>
                  <Label>
                    Confirm password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="confirmPassword"
                      type={showConfirmPwd ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={onConfirmPasswordChange}
                    />
                    <span
                      onClick={() => setShowConfirmPwd((s) => !s)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={showConfirmPwd ? "Hide password" : "Show password"}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowConfirmPwd((s) => !s)}
                    >
                      {showConfirmPwd ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {note && <p className="text-green-600 text-sm">{note}</p>}

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={loading}>
                {loading ? (isResetMode ? "Updating…" : "Sending…") : isResetMode ? "Update password" : "Send reset link"}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            {isResetMode ? (
              <>
                Remembered it?{" "}
                <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Back to Sign In
                </Link>
              </>
            ) : (
              <>
                Never mind?{" "}
                <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Back to Sign In
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

