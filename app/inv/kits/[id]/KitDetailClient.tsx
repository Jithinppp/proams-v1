"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar, Button } from "@/components";
import { ArrowLeft, Package, Edit, Trash2, Camera, Zap } from "lucide-react";
import { EditKitModal } from "@/components/EditKitModal";
import { DeleteKitModal } from "@/components/DeleteKitModal";
import { removeKitItem } from "@/lib/actions/kits";

interface Asset {
  id: string;
  asset_id: string;
  item_type: string;
  quantity: number;
  asset?: {
    asset_code: string;
    model?: { name: string; brand: string };
    location?: { name: string };
  } | null;
}

interface Consumable {
  id: string;
  model_id: string;
  item_type: string;
  quantity: number;
  model?: { name: string; brand: string };
}

interface Kit {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface KitDetailClientProps {
  kit: Kit;
  assets: Asset[];
  consumables: Consumable[];
  userEmail: string;
}

export function KitDetailClient({ kit, assets, consumables, userEmail }: KitDetailClientProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItemId(itemId);
    const result = await removeKitItem(itemId);
    setRemovingItemId(null);
    if (!result.error) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={userEmail} />
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/inv/kits" className="p-2 hover:bg-[#e4e4e7] rounded-lg">
              <ArrowLeft className="w-5 h-5 text-[#898989]" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f4f4f5] rounded-lg">
                <Package className="w-5 h-5 text-[#71717a]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#242424]">Kit Details</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#242424]">{kit.name}</h2>
          {kit.description && (
            <p className="text-sm text-[#71717a] mt-1">{kit.description}</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#242424] mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Assets ({assets.length})
          </h3>
          {assets.length > 0 ? (
            <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
                  <tr>
                    <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">Asset Code</th>
                    <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">Model</th>
                    <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">Location</th>
                    <th className="text-right text-sm font-medium text-[#71717a] px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-[#e4e4e7] last:border-0">
                      <td className="px-4 py-3 text-[#242424]">{asset.asset?.asset_code}</td>
                      <td className="px-4 py-3 text-[#242424]">
                        {asset.asset?.model?.brand} {asset.asset?.model?.name}
                      </td>
                      <td className="px-4 py-3 text-[#71717a]">{asset.asset?.location?.name || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveItem(asset.id)}
                          disabled={removingItemId === asset.id}
                          className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#71717a]">No assets in this kit</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#242424] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Consumables ({consumables.length})
          </h3>
          {consumables.length > 0 ? (
            <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
                  <tr>
                    <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">Item</th>
                    <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">Quantity</th>
                    <th className="text-right text-sm font-medium text-[#71717a] px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consumables.map((item) => (
                    <tr key={item.id} className="border-b border-[#e4e4e7] last:border-0">
                      <td className="px-4 py-3 text-[#242424]">
                        {item.model?.brand} {item.model?.name}
                      </td>
                      <td className="px-4 py-3 text-[#242424]">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItemId === item.id}
                          className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#71717a]">No consumables in this kit</p>
          )}
        </div>

        {showEditModal && (
          <EditKitModal
            kit={kit}
            onClose={() => setShowEditModal(false)}
            onSave={() => window.location.reload()}
          />
        )}

        {showDeleteModal && (
          <DeleteKitModal
            kit={kit}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </main>
    </div>
  );
}