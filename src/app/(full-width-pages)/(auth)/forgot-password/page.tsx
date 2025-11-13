"use client";

import dynamic from "next/dynamic";

const ForgotPasswordForm = dynamic(() => import("@/components/auth/ForgotPasswordForm"), {
  ssr: false,
});

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
