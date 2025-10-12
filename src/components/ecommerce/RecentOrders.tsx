"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";

interface Feedback {
  id: number;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  product: string;
  rating: number;
}

const feedbackData: Feedback[] = [
  {
    id: 1,
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    customerAvatar: "/images/user/user-01.jpg",
    product: "iPhone 15 Pro",
    rating: 5,
  },
  {
    id: 2,
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    customerAvatar: "/images/user/user-02.jpg",
    product: "MacBook Air M3",
    rating: 4,
  },
  {
    id: 3,
    customerName: "Alice Brown",
    customerEmail: "alice.brown@example.com",
    customerAvatar: "/images/user/user-03.jpg",
    product: "Apple Watch 9",
    rating: 2,
  },
  {
    id: 4,
    customerName: "Bob Johnson",
    customerEmail: "bob.johnson@example.com",
    customerAvatar: "/images/user/user-04.jpg",
    product: "iPad Pro M2",
    rating: 4,
  },
  {
    id: 5,
    customerName: "Carol Davis",
    customerEmail: "carol.davis@example.com",
    customerAvatar: "/images/user/user-05.jpg",
    product: "Galaxy S23",
    rating: 3,
  },
];

export default function RecentFeedbacks() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Feedbacks
        </h3>
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
          See all
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Customer
              </TableCell>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Product
              </TableCell>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Rating
              </TableCell>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {feedbackData.map((feedback) => {
              const status = feedback.rating >= 3 ? "Positive" : "Negative";

              return (
                <TableRow key={feedback.id}>
                  {/* Customer */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src={feedback.customerAvatar}
                          alt={feedback.customerName}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {feedback.customerName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {feedback.customerEmail}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Product */}
                  <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                    {feedback.product}
                  </TableCell>

                  {/* Rating */}
                  <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                    ⭐ {feedback.rating}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={status === "Positive" ? "success" : "error"}
                    >
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
