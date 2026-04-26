"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Select } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

const modelSchema = z.object({
  subcategory_id: z.string().min(1, "Subcategory is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less")
    .toUpperCase(),
  brand: z.string().min(1, "Brand is required").max(50, "Brand too long"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  specs: z.array(z.object({ key: z.string(), value: z.string() })),
});

type ModelFormData = z.infer<typeof modelSchema>;

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
}

interface AddModelFormProps {
  onSuccess?: () => void;
}

export function AddModelForm({ onSuccess }: AddModelFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    control,
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      specs: [{ key: "", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specs",
  });

  const watchedCategory = watch("category_id");
  const subcategoryValue = watch("subcategory_id");

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

  useEffect(() => {
    async function fetchSubcategories() {
      const categoryToUse = watchedCategory || selectedCategory;
      if (!categoryToUse) {
        setSubcategories([]);
        return;
      }
      setSubcategoriesLoading(true);
      const { data } = await supabase
        .from("subcategories")
        .select("id, category_id, code, name")
        .eq("category_id", categoryToUse)
        .eq("is_active", true)
        .order("name");
      if (data) setSubcategories(data);
      setSubcategoriesLoading(false);
    }
    fetchSubcategories();
  }, [watchedCategory, selectedCategory, supabase]);

  const onSubmit = async (data: ModelFormData) => {
    setIsLoading(true);
    setError(null);

    const specsObj = data.specs
      .filter((spec) => spec.key.trim() !== "")
      .reduce((acc, spec) => {
        acc[spec.key] = spec.value;
        return acc;
      }, {} as Record<string, string>);

    const specsJson = Object.keys(specsObj).length > 0 ? specsObj : null;

    const { error: insertError } = await supabase
      .from("models")
      .insert({
        subcategory_id: data.subcategory_id,
        code: data.code.toUpperCase(),
        brand: data.brand,
        name: data.name,
        specs: specsJson,
      });

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    reset({ specs: [{ key: "", value: "" }] });
    setSelectedCategory("");
    setIsLoading(false);
    router.refresh();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Category"
        options={categories.map((cat) => ({ value: cat.id, label: `${cat.code} - ${cat.name}` }))}
        value={watchedCategory || selectedCategory}
        onChange={(value) => {
          setSelectedCategory(value);
          setValue("category_id", value);
          setValue("subcategory_id", "", { shouldValidate: true });
        }}
        placeholder="Select a category"
        loading={categoriesLoading}
      />

      <Select
        label="Subcategory"
        options={subcategories.map((sub) => ({ value: sub.id, label: `${sub.code} - ${sub.name}` }))}
        value={subcategoryValue || ""}
        onChange={(value) => setValue("subcategory_id", value, { shouldValidate: true })}
        placeholder={selectedCategory ? "Select a subcategory" : "Select category first"}
        error={errors.subcategory_id?.message}
        loading={subcategoriesLoading}
      />

      <Input
        {...register("code")}
        label="Code"
        placeholder="SM58"
        error={errors.code?.message}
        onChange={(e) => {
          e.target.value = e.target.value.toUpperCase();
          register("code").onChange(e);
        }}
      />

      <Input
        {...register("brand")}
        label="Brand"
        placeholder="Shure"
        error={errors.brand?.message}
      />

      <Input
        {...register("name")}
        label="Name"
        placeholder="Dynamic Vocal Microphone"
        error={errors.name?.message}
      />

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-[#898989] mb-2">
          Specs
        </label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-1 sm:gap-2 items-start">
              <input
                {...register(`specs.${index}.key` as const)}
                placeholder="Key"
                className="w-[35%] sm:flex-[2] px-2 sm:px-3 py-2 bg-white border border-[#e4e4e7] rounded-lg text-sm text-[#242424] placeholder:text-[#a1a1aa] outline-none focus:border-[#a1a1aa] focus:ring-0"
              />
              <input
                {...register(`specs.${index}.value` as const)}
                placeholder="Value"
                className="w-[45%] sm:flex-[2] px-2 sm:px-3 py-2 bg-white border border-[#e4e4e7] rounded-lg text-sm text-[#242424] placeholder:text-[#a1a1aa] outline-none focus:border-[#a1a1aa] focus:ring-0"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-[#898989] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="flex items-center gap-1 text-xs text-[#71717a] hover:text-[#242424] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Spec
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" loading={isLoading} className="w-full">
        Add Model
      </Button>
    </form>
  );
}