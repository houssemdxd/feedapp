/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineFileText, AiOutlineFile, AiOutlineDelete } from "react-icons/ai";
import { getAllFormTemplates, deleteFormTemplate, getFormTemplateById } from "@/app/actions/formActions";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  title: string;
  createdAt: string;
  type: "form" | "post" | "survey";
}

interface TableProps {
  items: Item[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const ItemsTable: React.FC<TableProps> = ({ items, onDelete, onView }) => (
  <div className="overflow-x-auto w-full">
    <table className="min-w-full border border-gray-200 dark:border-gray-700">
      <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
        <tr>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Title</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Type <AiOutlineFileText className="text-gray-500 dark:text-gray-400" />
          </th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Created At</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.title}</td>
            <td className="px-4 py-2 text-gray-800 dark:text-gray-200 flex items-center gap-1">
              {item.type === "form" || item.type === "survey" ? <AiOutlineFileText /> : <AiOutlineFile />}
              {item.type === "form" ? "Form" : item.type === "survey" ? "Survey" : "Post"}
            </td>
            <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.createdAt}</td>
            <td className="px-4 py-2 text-gray-800 dark:text-gray-200 flex gap-2">
              <button
                className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                onClick={() => onView(item.id)}
              >
                View
              </button>
              <button
                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                onClick={() => onDelete(item.id)}
              >
                <AiOutlineDelete /> Delete
              </button>
             
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function FormsPostsTable() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"form" | "post" | "survey">("form");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFormData, setViewFormData] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res: any = await getAllFormTemplates();
        if (res.success) {
          const mappedItems: Item[] = res.data.map((f: any) => ({
            id: f.id,
            title: f.title,
            type: f.type,
            createdAt: new Date(f.createdAt).toLocaleDateString(),
          }));
          setItems(mappedItems);
        } else {
          console.error(res.error);
        }
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res: any = await deleteFormTemplate(id);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        alert("Deleted successfully!");
      } else {
        alert("Failed to delete: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting.");
    }
  };



  const handleViewForm = async (id: string) => {
    try {
      const res = await getFormTemplateById(id);
      if (res.success) {
        setViewFormData(res.data);
      } else {
        alert("Failed to fetch form: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching form");
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  const filteredItems = items.filter((item) => item.type === activeTab);

  return (
    <div className="p-5 w-full relative">
      {/* Sticky Tab Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-2 sticky top-0 bg-white dark:bg-gray-900 z-10">
        {["form", "survey", "post"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 px-4 py-2 text-center font-medium ${
              activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab(tab as "form" | "post" | "survey")}
          >
            {tab === "form" ? (
              <span className="flex items-center justify-center gap-1">
                <AiOutlineFileText /> Form
              </span>
            ) : tab === "survey" ? (
              <span className="flex items-center justify-center gap-1">
                <AiOutlineFileText /> Survey
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <AiOutlineFile /> Post
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto max-h-[60vh]">
        <ItemsTable
          items={filteredItems}
          onDelete={handleDelete}
          onView={handleViewForm}
        />
      </div>

      {/* Modal Preview */}
    {viewFormData && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn"
    onClick={() => setViewFormData(null)} // close if click outside
  >
    <div
      className="relative bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 w-full max-w-lg md:max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
      onClick={(e) => e.stopPropagation()} // prevent background click close
    >
      {/* Close Button */}
      <button
        onClick={() => setViewFormData(null)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
      >
        ✕
      </button>

      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        {viewFormData.form.title}
      </h3>

      <form className="space-y-6">
        {viewFormData.questions.length > 0 ? (
          viewFormData.questions.map((q: any) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200">
                {q.question}
              </label>

              {q.type === "text" && (
                <input
                  type="text"
                  placeholder="Enter your answer"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 w-full dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}

              {q.type === "radio" &&
                q.elements?.map((el: string, i: number) => (
                  <label key={i} className="flex items-center gap-2 mb-1 text-gray-700 dark:text-gray-300">
                    <input type="radio" name={q.id} className="text-blue-500" /> {el}
                  </label>
                ))}

              {q.type === "checkbox" &&
                q.elements?.map((el: string, i: number) => (
                  <label key={i} className="flex items-center gap-2 mb-1 text-gray-700 dark:text-gray-300">
                    <input type="checkbox" name={q.id} className="text-blue-500" /> {el}
                  </label>
                ))}

              {q.type === "rating" && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <span key={r}>⭐</span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No questions available for this form.</p>
        )}
      </form>
    </div>
  </div>
)}

    </div>
  );
}
