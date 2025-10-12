"use client";
import Image from "next/image";
import CountryMap from "./CountryMap";
import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

// Données feedback par pays
const feedbackData = [
  { id: 1, country: "USA", flag: "/images/country/country-01.svg", feedbacks: 2379 },
  { id: 2, country: "France", flag: "/images/country/country-02.svg", feedbacks: 589 },
  { id: 3, country: "UK", flag: "/images/country/country-04.svg", feedbacks: 310 },
  { id: 4, country: "Others", flag: "/images/country/country-05.svg", feedbacks: 120 },
];

// Calculer les pourcentages normalisés pour que la somme soit 100 %
const totalFeedbacks = feedbackData.reduce((sum, item) => sum + item.feedbacks, 0);
const feedbackDataWithPercent = feedbackData.map(item => ({
  ...item,
  percentage: Math.round((item.feedbacks / totalFeedbacks) * 100),
}));

export default function FeedbackDemographicCard() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Feedbacks Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of feedbacks based on country
          </p>
        </div>

      
      </div>

      {/* Map */}
      <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      {/* Scrollable feedback list (max 3 éléments visibles) */}
      <div className="space-y-4 max-h-[9rem] overflow-y-auto custom-scrollbar">
        {feedbackDataWithPercent.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={item.flag}
                  alt={item.country}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white/90">{item.country}</p>
                <span className="block text-gray-500 text-xs dark:text-gray-400">
                  {item.feedbacks} Feedbacks
                </span>
              </div>
            </div>

            
          {/* Barre + pourcentage alignée à gauche */}
            <div className="flex items-center gap-2 w-[140px]">
              {/* Barre de progression */}
              <div className="relative flex-1 h-2 rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 h-full rounded-sm bg-brand-500"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              {/* Pourcentage à droite de la barre */}
              <span className="font-medium text-gray-800 text-sm dark:text-white/90">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
