"use client";

import { FC } from "react";
import countries from "world-countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
}

// Build list: exclude Israel; include Palestine (PS)
const formattedCountries = (() => {
  // 1) Start from world-countries
  const base = countries
    // remove Israel by ISO-2 or name match
    .filter(c => c.cca2 !== "IL" && c.name.common.toLowerCase() !== "israel")
    // map to {value,label}
    .map((c) => ({
      value: c.cca2,
      label: c.name.common,
    }));

  // 2) Ensure Palestine exists (some datasets already have it as PS)
  const hasPalestine = base.some(
    (c) =>
      c.value === "PS" ||
      c.label.toLowerCase().includes("palestine")
  );

  if (!hasPalestine) {
    base.push({ value: "PS", label: "Palestine" });
  }

  // 3) Sort alphabetically
  base.sort((a, b) => a.label.localeCompare(b.label));
  return base;
})();

const CountrySelect: FC<CountrySelectProps> = ({ value, onChange }) => {
  const baseClasses =
    "w-full px-3 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:bg-gray-800 focus:outline-none focus:ring-2";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={baseClasses}   // <-- fixed stray quote
    >
      <option value="">Select a country</option>
      {formattedCountries.map((country) => (
        <option key={country.value} value={country.value}>
          {country.label}
        </option>
      ))}
    </select>
  );
};

export default CountrySelect;
