import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, AddModelForm, ModelsList } from "@/components";
import { ArrowLeft } from "lucide-react";

export default async function ModelsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: models } = await supabase
    .from("models")
    .select(`
      id,
      subcategory_id,
      code,
      brand,
      name,
      specs,
      is_active,
      created_at,
      subcategories (
        code,
        name,
        categories (code)
      )
    `)
    .order("created_at", { ascending: false });

  const formattedModels = (models || []).map((model: any) => ({
    id: model.id,
    subcategory_id: model.subcategory_id,
    code: model.code,
    brand: model.brand,
    name: model.name,
    specs: model.specs,
    is_active: model.is_active,
    subcategory: model.subcategories ? {
      code: model.subcategories.code,
      name: model.subcategories.name,
      category: model.subcategories.categories ? { code: model.subcategories.categories.code } : undefined,
    } : undefined,
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/inv/catalog"
            className="p-2 hover:bg-[#e4e4e7] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#898989]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#242424]">Models</h1>
            <p className="text-sm text-[#898989]">Equipment models and specifications</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-sm font-semibold text-[#242424] mb-4">
              Add New Model
            </h2>
            <AddModelForm />
          </div>

          <ModelsList models={formattedModels} />
        </div>
      </main>
    </div>
  );
}