import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, StatsCard } from "@/components";
import { Package, LayoutGrid, MapPin, PackageOpen, Clock, History, Box, Truck } from "lucide-react";

export default async function InvDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [assetsResult, categoriesResult, locationsResult, modelsResult] = await Promise.all([
    supabase.from("assets").select("id, status", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("storage_locations").select("id", { count: "exact" }),
    supabase.from("models").select("id", { count: "exact" }),
  ]);

  const { data: recentActivity } = await supabase
    .from("activity_log")
    .select("*, user:profiles(email)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentAssets } = await supabase
    .from("assets")
    .select("id, asset_code, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  const assets = assetsResult.data || [];
  const availableCount = assets.filter((a) => a.status === "AVAILABLE").length;

  const quickActions = [
    {
      icon: Package,
      title: "Asset Management",
      description: "Detailed tracking & technical specifications of all units.",
      href: "/inv/assets",
    },
    {
      icon: LayoutGrid,
      title: "Catalog Builder",
      description: "Maintain the global taxonomy of Categories and Models.",
      href: "/inv/catalog",
    },
    {
      icon: MapPin,
      title: "Storage Layout",
      description: "Define warehouse topography, rooms, and bin identifiers.",
      href: "/inv/locations",
    },
    {
      icon: PackageOpen,
      title: "Consumables",
      description: "Stock levels for non-serialized items and supplies.",
      href: "/inv/consumables",
    },
    {
      icon: Box,
      title: "Kits",
      description: "Bundled equipment packages for quick deployment.",
      href: "/inv/kits",
    },
    {
      icon: Truck,
      title: "Suppliers",
      description: "Manage vendors for equipment and consumables.",
      href: "/inv/suppliers",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-[#242424] mb-8">Inventory Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label="Total Assets"
            value={assets.length}
            subtext={`${availableCount} available`}
          />
          <StatsCard
            label="Categories"
            value={categoriesResult.count || 0}
            subtext="In catalog"
          />
          <StatsCard
            label="Models"
            value={modelsResult.count || 0}
            subtext="Products"
          />
          <StatsCard
            label="Storage Locations"
            value={locationsResult.count || 0}
            subtext="Active locations"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#242424] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-start p-6 bg-white border border-[#e4e4e7] rounded-lg transition-all hover:border-[#242424]/10 hover:shadow-md text-left"
              >
                <div className="p-3 rounded-md bg-[#f5f5f5] text-[#242424] transition-all group-hover:bg-[#242424] group-hover:text-white">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="mt-4 space-y-1.5">
                  <span className="text-sm font-semibold text-[#242424] leading-tight block">
                    {action.title}
                  </span>
                  <span className="text-xs text-[#898989] leading-relaxed block">
                    {action.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {recentActivity && recentActivity.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#242424]">Recent Activity</h2>
              <Link 
                href="/inv/activity" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                View All
              </Link>
            </div>
            <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
                  <tr>
                    <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Action</th>
                    <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">User</th>
                    <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e4e7]">
                  {recentActivity.map((log: any) => (
                    <tr key={log.id} className="hover:bg-[#fafafa]">
                      <td className="px-4 py-3 text-sm text-[#242424]">
                        {log.entity_type}: {log.action.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#71717a]">
                        {log.user?.email?.split("@")[0] || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#71717a]">
                        {new Date(log.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}