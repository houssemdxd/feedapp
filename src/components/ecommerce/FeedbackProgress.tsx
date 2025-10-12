"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

// Données feedback pour l'exemple
const feedbackStats = {
  total: 3287,
  positive: 2379,
  negative: 908,
};

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function FeedbackChart() {
  const [isOpen, setIsOpen] = useState(false);

  const series = [Math.round((feedbackStats.positive / feedbackStats.total) * 100)];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: { type: "radialBar", height: 330, fontFamily: "Outfit, sans-serif", sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Positive Feedback"],
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Feedback Progress</h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Positive feedback percentage vs total
            </p>
          </div>

          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
              <DropdownItem onItemClick={closeDropdown} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
                View All Feedbacks
              </DropdownItem>
              <DropdownItem onItemClick={closeDropdown} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
                Export
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Radial Chart */}
        <div className="relative mt-6 max-h-[330px]">
          <ReactApexChart options={options} series={series} type="radialBar" height={330} />
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            +{series[0]}%
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          You have received {feedbackStats.total} feedbacks today. {feedbackStats.positive} are positive and {feedbackStats.negative} are negative.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Total Feedbacks</p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{feedbackStats.total}</p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Positive</p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{feedbackStats.positive}</p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Negative</p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{feedbackStats.negative}</p>
        </div>
      </div>
    </div>
  );
}
