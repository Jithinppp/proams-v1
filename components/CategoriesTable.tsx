"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditCategoryModal } from "./EditCategoryModal";

interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  if (categories.length === 0) {
    return (
      <div className="bg-white border border-[#e4e4e7] rounded-lg p-8 text-center">
        <p className="text-[#898989]">No categories yet</p>
        <p className="text-sm text-[#a1a1aa]">Add your first category to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e4e4e7]">
            <tr>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-32">
                Code
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Description
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-24">
                Status
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e4e7]">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#242424]">
                    {category.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#242424]">
                    {category.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#898989]">
                    {category.description || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      category.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors text-[#898989] hover:text-[#242424]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={() => router.refresh()}
        />
      )}
    </>
  );
}