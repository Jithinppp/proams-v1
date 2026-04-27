"use client";

import { useState, useMemo } from "react";
import { Input } from "./Input";
import { ModelsTable } from "./ModelsTable";
import { Pagination } from "./Pagination";
import { Search, X } from "lucide-react";

const PAGE_SIZE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

  const filteredModels = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return models.filter((model) =>
      model.code.toLowerCase().includes(query) ||
      model.brand.toLowerCase().includes(query) ||
      model.name.toLowerCase().includes(query) ||
      (model.subcategory?.code && model.subcategory.code.toLowerCase().includes(query)) ||
      (model.subcategory?.name && model.subcategory.name.toLowerCase().includes(query)) ||
      (model.subcategory?.category?.code && model.subcategory.category.code.toLowerCase().includes(query))
    );
  }, [models, searchQuery]);

  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredModels.slice(start, start + PAGE_SIZE);
  }, [filteredModels, currentPage]);

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
            placeholder="Search models..."
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
          {filteredModels.length} {filteredModels.length === 1 ? "result" : "results"}
        </span>
      </div>
      <ModelsTable models={paginatedModels} />
      <Pagination
        currentPage={currentPage}
        totalItems={filteredModels.length}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  );
}