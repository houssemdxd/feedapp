// src/components/ui/Spinner.tsx
"use client";
import React from "react";

export default function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
      <path d="M4 12a8 8 0 0116 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" className="opacity-75" />
    </svg>
  );
}
