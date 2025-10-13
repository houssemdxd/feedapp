import type { Metadata } from "next";
import { FeedbackMetrics } from "@/components/ecommerce/FeedbackMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/FeedbackProgress";
import MonthlySalesChart from "@/components/ecommerce/MonthlyFeedbacksChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentFeedbacks";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import TopProducts from "@/components/ecommerce/TopProducts";
import TopActiveCustomers from "@/components/ecommerce/TopActiveCustomers";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Admin() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <FeedbackMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>

       <div className="col-span-12 xl:col-span-7 flex gap-4">
        <div className="flex-1">
          <TopProducts />
        </div>
        <div className="flex-1">
          <TopActiveCustomers />
        </div>
      </div>

    </div>
  );
}
