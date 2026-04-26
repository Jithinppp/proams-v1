"use client";

import { useState } from "react";
import { Input } from "./Input";
import { ModelsTable } from "./ModelsTable";
import { Search, X } from "lucide-react";

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

interface ModelsListProps {
  models: Model[];
}

export function ModelsList({ models }: ModelsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = models.filter((model) => {
    const query = searchQuery.toLowerCase();
    return (
      model.code.toLowerCase().includes(query) ||
      model.brand.toLowerCase().includes(query) ||
      model.name.toLowerCase().includes(query) ||
      (model.subcategory?.code && model.subcategory.code.toLowerCase().includes(query)) ||
      (model.subcategory?.name && model.subcategory.name.toLowerCase().includes(query)) ||
      (model.subcategory?.category?.code && model.subcategory.category.code.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-full max-w-sm relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Search className="w-4 h-4 text-[#a1a1aa]" />
          </div>
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a1a1aa] hover:text-[#71717a] hover:bg-[#f4f4f5] rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-sm text-[#71717a] whitespace-nowrap">
          {filteredModels.length} {filteredModels.length === 1 ? "result" : "results"}
        </span>
      </div>
      <ModelsTable models={filteredModels} />
    </div>
  );
}