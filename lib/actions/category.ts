"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCategory(id: string, field: string, value: string) {
  const supabase = await createClient();

  const updateData: Record<string, string | null> = {};
  
  if (field === "code") {
    updateData[field] = value.toUpperCase();
  } else if (field === "description") {
    updateData[field] = value || null;
  } else {
    updateData[field] = value;
  }

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inv/catalog/categories");
}