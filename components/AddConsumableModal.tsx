"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "./Input";
import { Button } from "./Button";
import { Select } from "./Select";
import { Package, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Model {
  id: string;
  name: string;
  brand: string;
  subcategory_id: string;
}

interface Location {
  id: string;
  name: string;
}

interface AddConsumableModalProps {
  categories: Category[];
  subcategories: Subcategory[];
  models: Model[];
  locations: Location[];
  onClose: () => void;
}

export function AddConsumableModal({
  categories,
  subcategories,
  models,
  locations,
  onClose,
}: AddConsumableModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [threshold, setThreshold] = useState("5");
  const [unitType, setUnitType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter((s) => s.category_id === selectedCategory);
  }, [selectedCategory, subcategories]);

  const filteredModels = useMemo(() => {
    if (!selectedSubcategory) return [];
    return models.filter((m) => m.subcategory_id === selectedSubcategory);
  }, [selectedSubcategory, models]);

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedSubcategory("");
      setSelectedModel("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedSubcategory) {
      setSelectedModel("");
    }
  }, [selectedSubcategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModel) {
      setError("Please select a model");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const { error: insertError } = await supabase.from("consumables").insert({
      model_id: selectedModel,
      location_id: selectedLocation || null,
      quantity: parseInt(quantity) || 0,
      low_stock_threshold: parseInt(threshold) || 5,
      unit_type: unitType || null,
    });

    if (insertError) {
      setError(insertError.message);
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "Select category..." },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const subcategoryOptions = [
    { value: "", label: "Select subcategory..." },
    ...filteredSubcategories.map((s) => ({ value: s.id, label: s.name })),
  ];

  const modelOptions = [
    { value: "", label: "Select model..." },
    ...filteredModels.map((m) => ({ value: m.id, label: `${m.brand} - ${m.name}` })),
  ];

  const locationOptions = [
    { value: "", label: "Select location..." },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[#242424]">Add Consumable</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f4f4f5] rounded-lg">
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Select
            label="Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Select category..."
          />

          <Select
            label="Subcategory"
            options={subcategoryOptions}
            value={selectedSubcategory}
            onChange={setSelectedSubcategory}
            placeholder="Select subcategory..."
            disabled={!selectedCategory}
          />

          <Select
            label="Model"
            options={modelOptions}
            value={selectedModel}
            onChange={setSelectedModel}
            placeholder="Select model..."
            disabled={!selectedSubcategory}
          />

          <Select
            label="Location"
            options={locationOptions}
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Select location..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Initial Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              required
            />
            <Input
              type="number"
              label="Low Stock Threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              min="0"
            />
          </div>

          <Input
            label="Unit Type (optional)"
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
            placeholder="e.g., pieces, rolls, boxes"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Add Consumable
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}