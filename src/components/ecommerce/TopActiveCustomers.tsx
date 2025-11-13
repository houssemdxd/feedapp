"use client";

import React from "react";
import Image from "next/image";

interface CustomerItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  totalFeedbacks: number;
  avatar: string;
}

const topCustomers: CustomerItem[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    totalFeedbacks: 45,
    avatar: "/images/user/user-01.jpg",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    totalFeedbacks: 38,
    avatar: "/images/user/user-02.jpg",
  },
  {
    id: 3,
    firstName: "Alice",
    lastName: "Brown",
    email: "alice.brown@example.com",
    totalFeedbacks: 36,
    avatar: "/images/user/user-03.jpg",
  },
  {
    id: 4,
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@example.com",
    totalFeedbacks: 33,
    avatar: "/images/user/user-04.jpg",
  },
  {
    id: 5,
    firstName: "Carol",
    lastName: "Davis",
    email: "carol.davis@example.com",
    totalFeedbacks: 30,
    avatar: "/images/user/user-05.jpg",
  },
];

export default function TopActiveCustomers() {
  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 w-full h-[400px] p-6 flex flex-col">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
    Top Active Customers
  </h2>

  <div className="flex items-center justify-between px-2 mb-2 font-semibold text-gray-500 text-xs dark:text-gray-400">
    <span>Customer</span>
    <span>Feedbacks</span>
  </div>

  <div className="overflow-y-auto flex-1">
    {topCustomers.map((customer) => (
      <div key={customer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition mb-1 h-16">
        <div className="h-12 w-12 overflow-hidden rounded-full">
          <Image width={48} height={48} src={customer.avatar} alt={`${customer.firstName} ${customer.lastName}`} className="object-cover w-full h-full" />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {customer.firstName} {customer.lastName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</span>
        </div>

        <div className="ml-auto text-right">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">{customer.totalFeedbacks}</span>
        </div>
      </div>
    ))}
  </div>
</div>

  );
}
