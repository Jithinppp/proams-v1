import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, AssetsList, Button } from "@/components";
import { ArrowLeft, Package, Plus } from "lucide-react";

export default async function AssetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assets } = await supabase
    .from("assets")
    .select(`
      id,
      asset_code,
      serial_number,
      description,
      status,
      condition,
      case_number,
      location_id,
      model_id,
      is_active,
      location:storage_locations (name),
      model:models (
        name,
        brand,
        subcategory:subcategories (name)
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);

  const { data: locations } = await supabase
    .from("storage_locations")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const formattedAssets = (assets || []).map((asset: any) => ({
    id: asset.id,
    asset_code: asset.asset_code,
    serial_number: asset.serial_number,
    description: asset.description,
    status: asset.status,
    condition: asset.condition,
    case_number: asset.case_number,
    location_id: asset.location_id,
    model_id: asset.model_id,
    is_active: asset.is_active,
    location: asset.location ? { name: asset.location.name } : undefined,
    model: asset.model ? {
      name: asset.model.name,
      brand: asset.model.brand,
      subcategory: asset.model.subcategory ? { name: asset.model.subcategory.name } : undefined,
    } : undefined,
  }));

  const formattedLocations = (locations || []).map((loc: any) => ({
    id: loc.id,
    name: loc.name,
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/inv"
              className="p-2 hover:bg-[#e4e4e7] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#898989]" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f4f4f5] rounded-lg">
                <Package className="w-5 h-5 text-[#71717a]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#242424]">Assets</h1>
                <p className="text-sm text-[#898989]">Manage physical inventory assets</p>
              </div>
            </div>
          </div>
          <Link href="/inv/assets/add" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </Link>
        </div>

        <AssetsList assets={formattedAssets} locations={formattedLocations} />
      </main>
    </div>
  );
}