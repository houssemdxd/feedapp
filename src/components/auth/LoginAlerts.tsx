// app/signin/SigninAlerts.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Alert from "../ui/alert/Alert"; // adjust import if your UI path differs

type Kind = "success" | "warning" | "error";
type AlertDef = { variant: Kind; title: string; message: string };

export default function LoginAlerts() {
  const sp = useSearchParams();

   const [alertDef, setAlertDef] = useState<AlertDef | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only run once on mount to capture initial query params
    const signup = sp.get("signup");
    const v = sp.get("verified");
    
    let alert: AlertDef | null = null;
    
    if (signup === "success") {
      alert = { variant: "success", title: "Account created", message: "Your account was created successfully. Please sign in." };
    } else if (v === "success") {
      alert = { variant: "success", title: "Email verified", message: "Your email has been verified. You can now sign in." };
    } else if (v === "expired") {
      alert = { variant: "warning", title: "Link expired", message: "Your verification link expired. Please request a new one." };
    } else if (v === "invalid") {
      alert = { variant: "error", title: "Invalid link", message: "That verification link is not valid. Request a fresh link and try again." };
    } else if (v === "missing") {
      alert = { variant: "warning", title: "Missing token", message: "No verification token was provided." };
    } else if (v === "error") {
      alert = { variant: "error", title: "Something went wrong", message: "We couldn't verify your email. Please try again." };
    }
    
    if (alert) {
      setAlertDef(alert);
      setVisible(true);

      // Remove params without remounting the page
      const params = new URLSearchParams(window.location.search);
      params.delete("signup");
      params.delete("verified");
      const qs = params.toString();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState({}, "", newUrl);

      // Auto-hide after 5 seconds
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  if (!visible || !alertDef) return null;

  return (
    <div className="mb-4 transition-opacity duration-300">
      <Alert variant={alertDef.variant} title={alertDef.title} message={alertDef.message} />
    </div>
  );
}
