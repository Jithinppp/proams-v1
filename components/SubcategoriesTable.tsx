"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditSubcategoryModal } from "./EditSubcategoryModal";

interface Subcategory {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  category?: {
    code: string;
    name: string;
  };
}

interface SubcategoriesTableProps {
  subcategories: Subcategory[];
}

export function SubcategoriesTable({ subcategories }: SubcategoriesTableProps) {
  const router = useRouter();
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  if (subcategories.length === 0) {
    return (
      <div className="bg-white border border-[#e4e4e7] rounded-lg p-8 text-center">
        <p className="text-[#898989]">No subcategories yet</p>
        <p className="text-sm text-[#a1a1aa]">Add your first subcategory to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e4e4e7]">
            <tr>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-24">
                Category
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-24">
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
            {subcategories.map((subcategory) => (
              <tr key={subcategory.id} className="hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-[#71717a] bg-[#f4f4f5] px-2 py-1 rounded">
                    {subcategory.category?.code || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#242424]">
                    {subcategory.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#242424]">
                    {subcategory.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#898989]">
                    {subcategory.description || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      subcategory.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {subcategory.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingSubcategory(subcategory)}
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

      {editingSubcategory && (
        <EditSubcategoryModal
          subcategory={editingSubcategory}
          onClose={() => setEditingSubcategory(null)}
          onSave={() => router.refresh()}
        />
      )}
    </>
  );
}