"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Textarea, Select } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const subcategorySchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less")
    .toUpperCase(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long"),
});

type SubcategoryFormData = z.infer<typeof subcategorySchema>;

interface Category {
  id: string;
  code: string;
  name: string;
}

interface AddSubcategoryFormProps {
  onSuccess?: () => void;
}

export function AddSubcategoryForm({ onSuccess }: AddSubcategoryFormProps) {
  const router = useRouter();
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
    reset,
  } = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
  });

  const onSubmit = async (data: SubcategoryFormData) => {
    setIsLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("subcategories")
      .insert({
        category_id: data.category_id,
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || null,
      });

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    reset();
    setIsLoading(false);
    router.refresh();
    onSuccess?.();
  };

  const categoryValue = watch("category_id");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Category"
        options={categories.map((cat) => ({ value: cat.id, label: `${cat.code} - ${cat.name}` }))}
        value={categoryValue || ""}
        onChange={(value) => setValue("category_id", value, { shouldValidate: true })}
        placeholder="Select a category"
        error={errors.category_id?.message}
        loading={categoriesLoading}
      />

      <Input
        {...register("code")}
        label="Code"
        placeholder="SPK"
        error={errors.code?.message}
        onChange={(e) => {
          e.target.value = e.target.value.toUpperCase();
          register("code").onChange(e);
        }}
      />

      <Input
        {...register("name")}
        label="Name"
        placeholder="Speakers"
        error={errors.name?.message}
      />

      <Textarea
        {...register("description")}
        label="Description"
        placeholder="Optional description..."
        rows={3}
        error={errors.description?.message}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" loading={isLoading} className="w-full">
        Add Subcategory
      </Button>
    </form>
  );
}