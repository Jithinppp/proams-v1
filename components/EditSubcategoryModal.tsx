"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Textarea, Select } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

const editSubcategorySchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less")
    .toUpperCase(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long"),
});

type EditSubcategoryFormData = z.infer<typeof editSubcategorySchema>;

interface Category {
  id: string;
  code: string;
  name: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface EditSubcategoryModalProps {
  subcategory: Subcategory;
  onClose: () => void;
  onSave: () => void;
}

export function EditSubcategoryModal({ subcategory, onClose, onSave }: EditSubcategoryModalProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      const { data } = await supabase
        .from("categories")
        .select("id, code, name")
        .eq("is_active", true)
        .order("name");
      if (data) setCategories(data);
      setCategoriesLoading(false);
    }
    fetchCategories();
  }, [supabase]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditSubcategoryFormData>({
    resolver: zodResolver(editSubcategorySchema),
    defaultValues: {
      category_id: subcategory.category_id,
      code: subcategory.code,
      name: subcategory.name,
      description: subcategory.description || "",
    },
  });

  const onSubmit = async (data: EditSubcategoryFormData) => {
    setIsLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("subcategories")
      .update({
        category_id: data.category_id,
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || null,
      })
      .eq("id", subcategory.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onSave();
    onClose();
  };

  const categoryValue = watch("category_id");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#242424]">Edit Subcategory</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#898989]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Category"
            options={categories.map((cat) => ({ value: cat.id, label: `${cat.code} - ${cat.name}` }))}
            value={categoryValue || subcategory.category_id || ""}
            onChange={(value) => setValue("category_id", value, { shouldValidate: true })}
            placeholder="Select a category"
            error={errors.category_id?.message}
            loading={categoriesLoading}
          />

          <Input
            {...register("code")}
            label="Code"
            error={errors.code?.message}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              register("code").onChange(e);
            }}
          />

          <Input
            {...register("name")}
            label="Name"
            error={errors.name?.message}
          />

          <Textarea
            {...register("description")}
            label="Description"
            rows={3}
            error={errors.description?.message}
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}