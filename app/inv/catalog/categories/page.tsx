import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, AddCategoryForm, CategoriesList } from "@/components";
import { ArrowLeft, FolderTree } from "lucide-react";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, code, name, description, is_active, created_at")
    .order("created_at", { ascending: false });

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
            <h1 className="text-2xl font-semibold text-[#242424]">Categories</h1>
            <p className="text-sm text-[#898989]">Top-level taxonomy groups</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
            <h2 className="text-sm font-semibold text-[#242424] mb-4">
              Add New Category
            </h2>
            <AddCategoryForm />
          </div>

          <CategoriesList categories={categories || []} />
        </div>
      </main>
    </div>
  );
}