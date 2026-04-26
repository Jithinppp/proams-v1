"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Textarea } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const categorySchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less")
    .toUpperCase(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AddCategoryFormProps {
  onSuccess?: () => void;
}

export function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("categories")
      .insert({
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("code")}
        label="Code"
        placeholder="AUDIO"
        error={errors.code?.message}
        onChange={(e) => {
          e.target.value = e.target.value.toUpperCase();
          register("code").onChange(e);
        }}
      />

      <Input
        {...register("name")}
        label="Name"
        placeholder="Audio Equipment"
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
        Add Category
      </Button>
    </form>
  );
}