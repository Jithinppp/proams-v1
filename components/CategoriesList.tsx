"use client";

import { useState } from "react";
import { Input } from "./Input";
import { CategoriesTable } from "./CategoriesTable";
import { Search, X } from "lucide-react";

interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface CategoriesListProps {
  categories: Category[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.toLowerCase();
    return (
      category.code.toLowerCase().includes(query) ||
      category.name.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
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
            placeholder="Search categories..."
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
          {filteredCategories.length} {filteredCategories.length === 1 ? "result" : "results"}
        </span>
      </div>
      <CategoriesTable categories={filteredCategories} />
    </div>
  );
}