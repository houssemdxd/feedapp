"use client";

import dynamic from "next/dynamic";

const SignInForm = dynamic(() => import("@/components/auth/SignInForm"), {
  ssr: false, // désactive le rendu côté serveur
});

export default function SignIn() {
  return <SignInForm />;
}
