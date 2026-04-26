import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, AddSubcategoryForm, SubcategoriesList } from "@/components";
import { ArrowLeft } from "lucide-react";

export default async function SubcategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select(`
      id,
      category_id,
      code,
      name,
      description,
      is_active,
      created_at,
      categories (code, name)
    `)
    .order("created_at", { ascending: false });

  const formattedSubcategories = (subcategories || []).map((sub: any) => ({
    id: sub.id,
    category_id: sub.category_id,
    code: sub.code,
    name: sub.name,
    description: sub.description,
    is_active: sub.is_active,
    category: sub.categories ? { code: sub.categories.code, name: sub.categories.name } : undefined,
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
            <h1 className="text-2xl font-semibold text-[#242424]">Subcategories</h1>
            <p className="text-sm text-[#898989]">Second-level taxonomy groups</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-sm font-semibold text-[#242424] mb-4">
              Add New Subcategory
            </h2>
            <AddSubcategoryForm />
          </div>

          <SubcategoriesList subcategories={formattedSubcategories} />
        </div>
      </main>
    </div>
  );
}