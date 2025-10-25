"use client";

import { FC, useMemo } from "react";
import countries from "world-countries";
import { State } from "country-state-city";

interface StateSelectProps {
  country: string;   // name or code
  value: string;     // we store/display the clean name
  onChange: (value: string) => void;
  placeholder?: string;
}

function cleanSubdivisionName(name: string): string {
  return name
    .replace(/^\s*Governorate of\s+/i, "")
    .replace(/\s+(Governorate|Province|State|Region|District|Prefecture)$/i, "")
    .trim();
}

const baseClasses =
  "w-full px-3 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:bg-gray-800 focus:outline-none focus:ring-2";

// ★ Static list used ONLY for PS (Palestine)
const PALESTINE_STATES = [
  // West Bank
  "Jenin",
  "Tubas",
  "Tulkarm",
  "Nablus",
  "Qalqilya",
  "Salfit",
  "Ramallah and Al-Bireh",
  "Jericho and Al Aghwar",
  "Jerusalem",
  "Bethlehem",
  "Hebron",
  // Gaza Strip
  "North Gaza",
  "Gaza",
  "Deir al-Balah",
  "Khan Yunis",
  "Rafah",
];

/** Convert a country input (name or code) to ISO-2 (e.g., "US", "TN"). */
function toISO2Country(input: string): string | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  let hit = countries.find((c) => c.cca2.toLowerCase() === s);
  if (hit) return hit.cca2;

  hit = countries.find((c) => c.cca3.toLowerCase() === s);
  if (hit) return hit.cca2;

  hit = countries.find((c) => c.name.common.toLowerCase() === s);
  if (hit) return hit.cca2;

  hit = countries.find((c) => c.name.official.toLowerCase() === s);
  if (hit) return hit.cca2;

  return null;
}

const StateSelect: FC<StateSelectProps> = ({
  country,
  value,
  onChange,
  placeholder = "Select state / province",
}) => {
  const iso2 = useMemo(() => toISO2Country(country), [country]);

  const states = useMemo(() => {
    if (!iso2) return [];

    // ★ If Palestine, use static list
    if (iso2 === "PS") {
      return PALESTINE_STATES.map((name) => ({
        name,
        isoCode: name.toUpperCase().replace(/[^A-Z0-9]/g, "_"), // just for React key
      }));
    }

    // Otherwise, use dynamic data
    return (State.getStatesOfCountry(iso2) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [iso2]);

  const disabled = !iso2 || states.length === 0;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={baseClasses}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <option value="">
        {disabled ? "N/A for this country" : placeholder}
      </option>

      {states
        .map((s) => ({
          raw: s.name,
          clean: cleanSubdivisionName(s.name),
          iso: (s as any).isoCode ?? s.name, // ensure a stable key
        }))
        .filter(
          (item, idx, arr) =>
            arr.findIndex((x) => x.clean === item.clean) === idx
        )
        .sort((a, b) => a.clean.localeCompare(b.clean))
        .map((s) => (
          <option key={s.iso} value={s.clean}>
            {s.clean}
          </option>
        ))}
    </select>
  );
};

export default StateSelect;
