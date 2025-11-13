"use client";
import React, { useMemo } from "react";

import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type BarChartOneSeries = {
  name: string;
  data: number[];
};

type BarChartOneProps = {
  categories?: string[];
  series?: BarChartOneSeries[];
  colors?: string[];
  height?: number;
  stacked?: boolean;
  minWidth?: number;
};

const DEFAULT_CATEGORIES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_SERIES: BarChartOneSeries[] = [
  {
    name: "Sales",
    data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
  },
];

export default function BarChartOne({
  categories = DEFAULT_CATEGORIES,
  series = DEFAULT_SERIES,
  colors = ["#465fff"],
  height = 180,
  stacked = false,
  minWidth = 1000,
}: BarChartOneProps) {
  const safeCategories = categories.length > 0 ? categories : ["No data"];
  const safeSeries = series.length > 0 ? series : DEFAULT_SERIES;

  const options: ApexOptions = useMemo(() => {
    const showXAxisTooltip = safeCategories !== DEFAULT_CATEGORIES && safeCategories[0] !== "No data";
    return {
      colors,
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height,
        stacked,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "39%",
          borderRadius: 5,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 4,
        colors: ["transparent"],
      },
      xaxis: {
        categories: safeCategories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontFamily: "Outfit",
      },
      yaxis: {
        title: {
          text: undefined,
        },
        labels: {
          formatter: (value) => `${Math.round(value * 100) / 100}`,
        },
      },
      grid: {
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        x: {
          show: showXAxisTooltip,
        },
        y: {
          formatter: (val: number) => `${val}`,
        },
      },
    };
  }, [colors, height, safeCategories, stacked]);

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" style={{ minWidth }}>
        <ReactApexChart options={options} series={safeSeries} type="bar" height={height} />
      </div>
    </div>
  );
}
