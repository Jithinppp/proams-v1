"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Select } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { X, Plus } from "lucide-react";

const editModelSchema = z.object({
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

type EditModelFormData = z.infer<typeof editModelSchema>;

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

interface Model {
  id: string;
  subcategory_id: string;
  code: string;
  brand: string;
  name: string;
  specs: Record<string, any> | null;
  is_active: boolean;
}

interface EditModelModalProps {
  model: Model;
  onClose: () => void;
  onSave: () => void;
}

export function EditModelModal({ model, onClose, onSave }: EditModelModalProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

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
      setSubcategoriesLoading(true);
      if (!selectedCategory) {
        const { data } = await supabase
          .from("subcategories")
          .select("id, category_id, code, name")
          .eq("is_active", true)
          .order("name");
        if (data) setSubcategories(data);
        setSubcategoriesLoading(false);
        return;
      }
      const { data } = await supabase
        .from("subcategories")
        .select("id, category_id, code, name")
        .eq("category_id", selectedCategory)
        .eq("is_active", true)
        .order("name");
      if (data) setSubcategories(data);
      setSubcategoriesLoading(false);
    }
    fetchSubcategories();
  }, [selectedCategory, supabase]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm<EditModelFormData>({
    resolver: zodResolver(editModelSchema),
    defaultValues: {
      subcategory_id: model.subcategory_id,
      code: model.code,
      brand: model.brand,
      name: model.name,
      specs: model.specs 
        ? Object.entries(model.specs).map(([key, value]) => ({ key, value: String(value) }))
        : [{ key: "", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specs",
  });

  const subcategoryValue = watch("subcategory_id");

  useEffect(() => {
    async function findCategory() {
      if (subcategories.length > 0) {
        const sub = subcategories.find((s) => s.id === model.subcategory_id);
        if (sub) {
          setSelectedCategory(sub.category_id);
        }
      }
    }
    findSubcategory();
  }, [subcategories, model.subcategory_id]);

  const findSubcategory = async () => {
    const { data } = await supabase
      .from("subcategories")
      .select("category_id")
      .eq("id", model.subcategory_id)
      .single();
    if (data) setSelectedCategory(data.category_id);
  };

  const onSubmit = async (data: EditModelFormData) => {
    setIsLoading(true);
    setError(null);

    const specsObj = data.specs
      .filter((spec) => spec.key.trim() !== "")
      .reduce((acc, spec) => {
        acc[spec.key] = spec.value;
        return acc;
      }, {} as Record<string, string>);

    const specsJson = Object.keys(specsObj).length > 0 ? specsObj : null;

    const { error: updateError } = await supabase
      .from("models")
      .update({
        subcategory_id: data.subcategory_id,
        code: data.code.toUpperCase(),
        brand: data.brand,
        name: data.name,
        specs: specsJson,
      })
      .eq("id", model.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#242424]">Edit Model</h2>
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
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setValue("subcategory_id", "", { shouldValidate: true });
            }}
            placeholder="Select a category"
            loading={categoriesLoading}
          />

          <Select
            label="Subcategory"
            options={subcategories.map((sub) => ({ value: sub.id, label: `${sub.code} - ${sub.name}` }))}
            value={subcategoryValue || model.subcategory_id || ""}
            onChange={(value) => setValue("subcategory_id", value, { shouldValidate: true })}
            placeholder={selectedCategory ? "Select a subcategory" : "Select category first"}
            error={errors.subcategory_id?.message}
            loading={subcategoriesLoading}
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
            {...register("brand")}
            label="Brand"
            error={errors.brand?.message}
          />

          <Input
            {...register("name")}
            label="Name"
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