// app/login/LoginAlerts.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Alert from "../ui/alert/Alert";

export default function LoginAlerts() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // read once from the current URL
  const justSignedUp = useMemo(() => sp.get("signup") === "success", [sp]);

  const [visible, setVisible] = useState(justSignedUp);

  useEffect(() => {
    if (!justSignedUp) return;

    // hide after 5 seconds
    const t = setTimeout(() => setVisible(false), 5000);

    // also remove the query param so it won’t show again on reload
    const params = new URLSearchParams(sp.toString());
    params.delete("signup");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);

    return () => clearTimeout(t);
  }, [justSignedUp, sp, router, pathname]);

  if (!visible) return null;

  return (
    <div className="mb-4 transition-opacity duration-300">
      <Alert
        variant="success"
        title="Account created"
        message="Your account was created successfully. Please sign in."
      />
    </div>
  );
}
