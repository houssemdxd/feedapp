"use client";

import React from "react";
import Image from "next/image";

interface FeedbackItem {
  id: number;
  name: string;
  category: string;
  averageRating: number;
  totalFeedbacks: number;
  image: string;
}

const feedbackItems: FeedbackItem[] = [
  { id: 1, name: "iPhone 15 Pro", category: "Smartphone", averageRating: 4.8, totalFeedbacks: 127, image: "/images/product/product-03.jpg" },
  { id: 2, name: "MacBook Air M3", category: "Laptop", averageRating: 4.6, totalFeedbacks: 112, image: "/images/product/product-01.jpg" },
  { id: 3, name: "Apple Watch 9", category: "Smartwatch", averageRating: 4.7, totalFeedbacks: 98, image: "/images/product/product-02.jpg" },
  { id: 4, name: "iPad Pro M2", category: "Tablet", averageRating: 4.5, totalFeedbacks: 90, image: "/images/product/product-04.jpg" },
  { id: 5, name: "Galaxy S23", category: "Smartphone", averageRating: 4.4, totalFeedbacks: 77, image: "/images/product/product-05.jpg" },
];

export default function TopFeedbacksScrollable() {
  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 w-full h-[400px] p-6 flex flex-col">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
    Top Feedbacks
  </h2>

  <div className="grid grid-cols-12 gap-3 px-2 mb-2 font-semibold text-gray-500 text-xs dark:text-gray-400">
    <span className="col-span-8">Product</span>
    <span className="col-span-4 text-right">Rating</span>
  </div>

  <div className="overflow-y-auto flex-1">
    {feedbackItems.map((item) => (
      <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition mb-1 h-14">
        <div className="col-span-8 flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-md">
            <Image width={40} height={40} src={item.image} alt={item.name} className="object-cover w-full h-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">{item.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.category}</span>
          </div>
        </div>

        <div className="col-span-4 text-right flex flex-col items-end">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">⭐ {item.averageRating.toFixed(1)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.totalFeedbacks} Feedbacks</span>
        </div>
      </div>
    ))}
  </div>
</div>

  );
}
