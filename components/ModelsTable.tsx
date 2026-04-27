"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditModelModal } from "./EditModelModal";

interface Model {
  id: string;
  subcategory_id: string;
  code: string;
  brand: string;
  name: string;
  specs: Record<string, any> | null;
  is_active: boolean;
  subcategory?: {
    code: string;
    name: string;
    category?: {
      code: string;
    };
  };
}

interface ModelsTableProps {
  models: Model[];
}

export function ModelsTable({ models }: ModelsTableProps) {
  const router = useRouter();
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  if (models.length === 0) {
    return (
      <div className="bg-white border border-[#e4e4e7] rounded-lg p-8 text-center">
        <p className="text-[#898989]">No models yet</p>
        <p className="text-sm text-[#a1a1aa]">Add your first model to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e4e4e7]">
            <tr>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-20">
                Cat
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-20">
                Subcat
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-20">
                Code
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-24">
                Brand
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-20">
                Status
              </th>
              <th className="text-left text-xs font-medium text-[#898989] uppercase tracking-wider px-4 py-3 w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e4e7]">
            {models.map((model) => (
              <tr key={model.id} className="hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-[#71717a] bg-[#f4f4f5] px-2 py-1 rounded">
                    {model.subcategory?.category?.code || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-[#71717a] bg-[#f4f4f5] px-2 py-1 rounded">
                    {model.subcategory?.code || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#242424]">
                    {model.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#242424]">
                    {model.brand}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#242424]">
                    {model.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      model.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {model.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingModel(model)}
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

      {editingModel && (
        <EditModelModal
          model={editingModel}
          onClose={() => setEditingModel(null)}
          onSave={() => router.refresh()}
        />
      )}
    </>
  );
}