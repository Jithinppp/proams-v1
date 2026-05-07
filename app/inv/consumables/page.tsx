import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components";
import { ArrowLeft, Package, Plus } from "lucide-react";
import { ConsumablesClient } from "./ConsumablesClient";

export const dynamic = "force-dynamic";

export default async function ConsumablesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [consumablesRes, categoriesRes, subcategoriesRes, modelsRes, locationsRes, suppliersRes] = await Promise.all([
    supabase.from("consumables").select("*, model:models(name, brand, code), location:storage_locations(name), supplier:suppliers(name)").order("updated_at", { ascending: false }),
    supabase.from("categories").select("id, name").eq("is_active", true).order("name"),
    supabase.from("subcategories").select("id, name, category_id").eq("is_active", true).order("name"),
    supabase.from("models").select("id, name, brand, subcategory_id").eq("is_active", true).order("brand").order("name"),
    supabase.from("storage_locations").select("id, name").eq("is_active", true).order("name"),
    supabase.from("suppliers").select("id, name").order("name"),
  ]);

  const categories = (categoriesRes.data || []).map((c: any) => ({ id: c.id, name: c.name }));
  const subcategories = (subcategoriesRes.data || []).map((s: any) => ({ id: s.id, name: s.name, category_id: s.category_id }));
  const models = (modelsRes.data || []).map((m: any) => ({ id: m.id, name: m.name, brand: m.brand, subcategory_id: m.subcategory_id }));
  const locations = (locationsRes.data || []).map((l: any) => ({ id: l.id, name: l.name }));
  const suppliers = (suppliersRes.data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    contact_name: s.contact_name,
    email: s.email,
    phone: s.phone,
    website: s.website,
    address: s.address,
    notes: s.notes,
    rating: s.rating,
  }));

  return (
    <ConsumablesClient 
      consumables={consumablesRes.data || []} 
      userEmail={user?.email || ""}
      categories={categories}
      subcategories={subcategories}
      models={models}
      locations={locations}
      suppliers={suppliers}
    />
  );
}