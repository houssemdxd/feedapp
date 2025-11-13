"use client";
import React, { useMemo } from "react";

import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type LineChartSeries = {
  name: string;
  data: number[];
};

type LineChartOneProps = {
  categories?: string[];
  series?: LineChartSeries[];
  colors?: string[];
  height?: number;
  area?: boolean;
  showLegend?: boolean;
  minWidth?: number;
};

const DEFAULT_LINE_CATEGORIES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_LINE_SERIES: LineChartSeries[] = [
  {
    name: "Sales",
    data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
  },
  {
    name: "Revenue",
    data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
  },
];

export default function LineChartOne({
  categories = DEFAULT_LINE_CATEGORIES,
  series = DEFAULT_LINE_SERIES,
  colors = ["#465FFF", "#9CB9FF"],
  height = 310,
  area = true,
  showLegend = false,
  minWidth = 1000,
}: LineChartOneProps) {
  const safeCategories = categories.length > 0 ? categories : ["No data"];
  const safeSeries = series.length > 0 ? series : DEFAULT_LINE_SERIES;

  const options: ApexOptions = useMemo(() => {
    return {
      legend: {
        show: showLegend,
        position: "top",
        horizontalAlign: "left",
      },
      colors,
      chart: {
        fontFamily: "Outfit, sans-serif",
        height,
        type: area ? "area" : "line",
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "straight",
        width: 2,
      },
      fill: area
        ? {
            type: "gradient",
            gradient: {
              opacityFrom: 0.55,
              opacityTo: 0,
            },
          }
        : {
            opacity: 1,
          },
      markers: {
        size: 0,
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      grid: {
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        x: {
          show: true,
        },
      },
      xaxis: {
        type: "category",
        categories: safeCategories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
        },
        title: {
          text: "",
          style: {
            fontSize: "0px",
          },
        },
      },
    };
  }, [area, colors, height, safeCategories, showLegend]);

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartEight" style={{ minWidth }}>
        <ReactApexChart options={options} series={safeSeries} type={area ? "area" : "line"} height={height} />
      </div>
    </div>
  );
}
