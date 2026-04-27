"use client";

import { useState, useMemo } from "react";
import { Input } from "./Input";
import { CategoriesTable } from "./CategoriesTable";
import { Pagination } from "./Pagination";
import { Search, X } from "lucide-react";

const PAGE_SIZE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return categories.filter((category) =>
      category.code.toLowerCase().includes(query) ||
      category.name.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

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
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch("")}
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
      <CategoriesTable categories={paginatedCategories} />
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCategories.length}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  );
}