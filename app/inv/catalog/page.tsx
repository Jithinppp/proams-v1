import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components";
import { FolderTree, Layers, Box } from "lucide-react";

export default async function CatalogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categoriesResult, subcategoriesResult, modelsResult] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("subcategories").select("id", { count: "exact" }),
    supabase.from("models").select("id", { count: "exact" }),
  ]);

  const quickActions = [
    {
      icon: FolderTree,
      title: "Categories",
      description: "Top-level taxonomy groups (e.g., Audio, Video, Lighting)",
      href: "/inv/catalog/categories",
      count: categoriesResult.count || 0,
    },
    {
      icon: Layers,
      title: "Subcategories",
      description: "Types within categories (e.g., Speakers, Mixers, Projectors)",
      href: "/inv/catalog/subcategories",
      count: subcategoriesResult.count || 0,
    },
    {
      icon: Box,
      title: "Models",
      description: "Specific products with brand, specs, and serial tracking",
      href: "/inv/catalog/models",
      count: modelsResult.count || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-[#242424] mb-8">Catalog Builder</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-start p-6 bg-white border border-[#e4e4e7] rounded-lg transition-all hover:border-[#242424]/10 hover:shadow-md text-left"
            >
              <div className="p-3 rounded-md bg-[#f5f5f5] text-[#242424] transition-all group-hover:bg-[#242424] group-hover:text-white">
                <action.icon className="w-6 h-6" />
              </div>
              <div className="mt-4 space-y-1">
                <span className="text-sm font-semibold text-[#242424] leading-tight block">
                  {action.title}
                </span>
                <span className="text-xs text-[#898989] leading-relaxed block">
                  {action.description}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#e4e4e7] w-full">
                <span className="text-xs text-[#898989]">{action.count} items</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-lg p-8">
          <h2 className="text-lg font-semibold text-[#242424] mb-6">How the Catalog Works</h2>

          <div className="prose prose-sm max-w-none text-[#898989]">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#242424] text-white flex items-center justify-center text-sm font-medium shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#242424] mb-1">Categories</h3>
                  <p className="text-xs leading-relaxed">
                    The top level of your taxonomy. Create categories to organize your equipment by type (e.g., Audio, Video, Lighting, Stage, Power).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#242424] text-white flex items-center justify-center text-sm font-medium shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#242424] mb-1">Subcategories</h3>
                  <p className="text-xs leading-relaxed">
                    The second level - types within each category. Example: Under "Audio", create subcategories like "Microphones", "Speakers", "Mixers", "Amps".
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#242424] text-white flex items-center justify-center text-sm font-medium shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#242424] mb-1">Models</h3>
                  <p className="text-xs leading-relaxed">
                    The product level - specific equipment you own. Each model links to a subcategory and contains brand, name, and technical specifications. Physical assets (individual units) are then created from these models.
                  </p>
                </div>
              </div>

              <div className="bg-[#f5f5f5] rounded-lg p-4 mt-6">
                <h4 className="text-xs font-semibold text-[#242424] mb-2">Creating a Model</h4>
                <p className="text-xs leading-relaxed">
                  When adding a new model, you must first select a <strong>Category</strong> and then a <strong>Subcategory</strong>. This establishes the relationship in the database. Only after a subcategory exists can you create models that belong to it.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-[#242424]">Flow:</span>
                  <span className="text-[#898989]">Category → Subcategory → Model → Assets</span>
                </div>
              </div>

              <div className="bg-[#f5f5f5] rounded-lg p-4">
                <h4 className="text-xs font-semibold text-[#242424] mb-2">Why This Matters</h4>
                <ul className="text-xs leading-relaxed space-y-1 text-[#898989]">
                  <li>• Filters work by category → subcategory → model hierarchy</li>
                  <li>• Asset codes are generated using category/subcategory codes</li>
                  <li>• Reports can show equipment breakdown by category</li>
                  <li>• Projects can request equipment by category or specific model</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}