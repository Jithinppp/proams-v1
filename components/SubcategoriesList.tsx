"use client";

import { useState } from "react";
import { Input } from "./Input";
import { SubcategoriesTable } from "./SubcategoriesTable";
import { Search, X } from "lucide-react";

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

interface SubcategoriesListProps {
  subcategories: Subcategory[];
}

export function SubcategoriesList({ subcategories }: SubcategoriesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubcategories = subcategories.filter((subcategory) => {
    const query = searchQuery.toLowerCase();
    return (
      subcategory.code.toLowerCase().includes(query) ||
      subcategory.name.toLowerCase().includes(query) ||
      (subcategory.description && subcategory.description.toLowerCase().includes(query)) ||
      (subcategory.category?.code && subcategory.category.code.toLowerCase().includes(query)) ||
      (subcategory.category?.name && subcategory.category.name.toLowerCase().includes(query))
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
            placeholder="Search subcategories..."
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
          {filteredSubcategories.length} {filteredSubcategories.length === 1 ? "result" : "results"}
        </span>
      </div>
      <SubcategoriesTable subcategories={filteredSubcategories} />
    </div>
  );
}