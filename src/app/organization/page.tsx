"use client";

import type { Metadata } from "next";
import React, { useEffect, useState } from "react";
import OrganizationFormsTable from "@/components/client/OrganizationForms";



export default function Organization() {
  const [background, setBackground] = useState<{ backgroundImage: string | null; backgroundColor: string }>({
    backgroundImage: null,
    backgroundColor: "#fef3c7",
  });

  useEffect(() => {
    const stored = localStorage.getItem("organizationPreferences");
    if (stored) {
      const prefs = JSON.parse(stored);
      setBackground({
        backgroundImage: prefs.backgroundImage || null,
        backgroundColor: prefs.backgroundColor || "#ffffff",
      });
    }
  }, []);

  const containerStyle: React.CSSProperties = {
    background: background.backgroundImage
      ? `url(${background.backgroundImage}) center/cover no-repeat`
      : background.backgroundColor,
    minHeight: "100vh",
    padding: "1rem",
  };

  return (
    <div style={containerStyle}>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <OrganizationFormsTable />
        </div>
      </div>
    </div>
  );
}
