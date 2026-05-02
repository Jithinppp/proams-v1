"use server";

import { createClient } from "@/lib/supabase/server";

export async function adjustConsumableQuantity(
  consumableId: string,
  adjustment: number
) {
  const supabase = await createClient();
  
  const { data: current } = await supabase
    .from("consumables")
    .select("quantity")
    .eq("id", consumableId)
    .single();

  if (!current) return { error: "Consumable not found" };

  const newQuantity = Math.max(0, current.quantity + adjustment);

  const { error } = await supabase
    .from("consumables")
    .update({ quantity: newQuantity })
    .eq("id", consumableId);

  if (error) {
    return { error: error.message };
  }

  return { success: true, quantity: newQuantity };
}