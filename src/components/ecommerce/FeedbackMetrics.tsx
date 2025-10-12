"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";

export const FeedbackMetrics = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 md:gap-6">
      {/* Most Liked Product */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          {/* Pouce vert vers le haut */}
          <svg
            className="w-6 h-6 text-green-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M2 21h4V9H2v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.21 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h7c.82 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.01l-.01-.01L23 10z"/>
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Most Liked Product
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              Smart Watch
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon /> 15%
          </Badge>
        </div>
      </div>

      {/* Most Disliked Product */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          {/* Pouce rouge vers le bas */}
          <svg
            className="w-6 h-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M2 3h4v12H2V3zm21 5c0 1.1-.9 2-2 2h-6.31l.95 4.57.03.32c0 .41-.17.79-.44 1.06L14.17 22l-6.58-6.59C7.21 15.05 7 14.55 7 14V5c0-1.1.9-2 2-2h7c.82 0 1.54.5 1.84 1.22l3.02 7.05c.09.23.14.47.14.73v1.01l-.01.01L23 8z"/>
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Most Disliked Product
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              Headphones X
            </h4>
          </div>
          <Badge color="error">
            <ArrowDownIcon /> 8%
          </Badge>
        </div>
      </div>
    </div>
  );
};
