import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components";
import { ArrowLeft, Plus } from "lucide-react";
import { SuppliersList } from "./SuppliersList";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: false });

  const formattedSuppliers = (suppliers || []).map((s: any) => ({
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={user?.email || ""} />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/inv"
              className="p-2 hover:bg-[#e4e4e7] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#898989]" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-[#242424]">Suppliers</h1>
              <p className="text-sm text-[#898989]">Manage equipment suppliers</p>
            </div>
          </div>
        </div>

        <SuppliersList suppliers={formattedSuppliers} />
      </main>
    </div>
  );
}