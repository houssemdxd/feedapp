"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronDownIcon, ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import type { UserRole } from "@/models/User";
import Link from "next/link";
import React, { useState } from "react";
import Select from "../form/Select";
import { useRouter } from "next/navigation";
import Spinner from "../ui/spinner/Spinner";

interface FormData {
  fname: string;
  lname: string;
  email: string;
  password: string;
  role: UserRole;

}
const roleOptions = [
  { value: "client", label: "Client" },
  { value: "organization", label: "Organization" },
];
export default function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fname: "",
    lname: "",
    email: "",
    password: "",
    role: "client",

  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as UserRole }));
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "role" ? (value as UserRole) : value,
    }));
  };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (!isChecked) {
  //     setError("You must accept Terms and Privacy Policy");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     const res = await fetch("/api/auth/signup", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) throw new Error(data.error || "Something went wrong");

  //     //alert("User created successfully! You can now log in.");
  //     setFormData({ fname: "", lname: "", email: "", password: "", role: "client" });
  //     setIsChecked(false);
  //     router.replace("/signin?signup=success");

  //   } catch (err: unknown) {
  //     if (err instanceof Error) setError(err.message);
  //     else setError(String(err));
  //   } finally {
  //     setLoading(false);
  //   }
  // };
 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isChecked) {
      setError("You must accept Terms and Privacy Policy");
      return;
    }
    if (loading) return; // guard double-clicks

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setFormData({ fname: "", lname: "", email: "", password: "", role: "client" });
      setIsChecked(false);
      router.replace("/signin?signup=success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
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
        <div>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign Up
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign up!
          </p>

          {error && <p className="mb-2 text-red-500 dark:text-red-400">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>First Name *</Label>
                <Input
                  type="text"
                  name="fname"
                  placeholder="Enter your first name"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  type="text"
                  name="lname"
                  placeholder="Enter your last name"
                  value={formData.lname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>
            <div>
              <Label>Role *</Label>
              <div className="relative">
                <Select
                  options={roleOptions}
                  placeholder="Choose a role"
                  onChange={handleRoleChange}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <p className="inline-block text-gray-500 dark:text-gray-400">
                By creating an account you agree to our Terms and Privacy Policy
              </p>
            </div>

            {/* Submit */}
            {/* <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button> */}
             <button
              type="submit"
              disabled={loading}
              aria-busy={loading || undefined}
              className={[
                "relative flex w-full items-center justify-center gap-2",
                "rounded-lg px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition",
                "bg-brand-500 hover:bg-brand-600",
                loading ? "cursor-not-allowed opacity-90" : ""
              ].join(" ")}
            >
              {loading && <Spinner />}
              <span className={loading ? "animate-pulse" : ""}>
                {loading ? "Signing up..." : "Sign Up"}
              </span>
            </button>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/signin" 
                className="font-medium text-brand-500 hover:text-brand-600 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
