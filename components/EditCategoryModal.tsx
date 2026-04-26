"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Textarea } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

const editCategorySchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less")
    .toUpperCase(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long"),
});

type EditCategoryFormData = z.infer<typeof editCategorySchema>;

interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface EditCategoryModalProps {
  category: Category;
  onClose: () => void;
  onSave: () => void;
}

export function EditCategoryModal({ category, onClose, onSave }: EditCategoryModalProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditCategoryFormData>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      code: category.code,
      name: category.name,
      description: category.description || "",
    },
  });

  const onSubmit = async (data: EditCategoryFormData) => {
    setIsLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("categories")
      .update({
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || null,
      })
      .eq("id", category.id);

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
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#242424]">Edit Category</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#898989]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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