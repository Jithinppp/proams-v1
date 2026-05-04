"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar, AddConsumableModal, EditConsumableModal, DeleteConsumableModal, Button } from "@/components";
import { ArrowLeft, Package, Plus, Minus, Loader2, Pencil, Trash2 } from "lucide-react";
import { adjustConsumableQuantity, getConsumables } from "@/lib/actions/consumables";
import type { ConsumableItem, Category, Subcategory, Model, Location, Supplier } from "@/lib/types";

export function ConsumablesClient({ 
  consumables: initialConsumables, 
  userEmail,
  categories,
  subcategories,
  models,
  locations,
  suppliers,
}: { 
  consumables: ConsumableItem[]; 
  userEmail: string;
  categories: Category[];
  subcategories: Subcategory[];
  models: Model[];
  locations: Location[];
  suppliers?: Supplier[];
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [consumables, setConsumables] = useState(initialConsumables);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [editingConsumable, setEditingConsumable] = useState<ConsumableItem | null>(null);
  const [deletingConsumable, setDeletingConsumable] = useState<ConsumableItem | null>(null);

  const lowStockCount = consumables.filter(c => c.quantity <= c.low_stock_threshold).length;
  const inStockCount = consumables.filter(c => c.quantity > c.low_stock_threshold).length;

  const handleAdjust = async (id: string, adjustment: number) => {
    setAdjustingId(id);
    
    const result = await adjustConsumableQuantity(id, adjustment);
    
    if (result && !result.error) {
      setConsumables((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: result.quantity ?? item.quantity } : item
        )
      );
    }
    
    setAdjustingId(null);
  };

  const refreshConsumables = async () => {
    const result = await getConsumables();
    if (result?.consumables) {
      setConsumables(result.consumables);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar email={userEmail} />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/inv" className="p-2 hover:bg-[#e4e4e7] rounded-lg">
              <ArrowLeft className="w-5 h-5 text-[#898989]" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f4f4f5] rounded-lg">
                <Package className="w-5 h-5 text-[#71717a]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#242424]">Consumables</h1>
                <p className="text-sm text-[#898989]">Track stock for non-serialized items</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Consumable
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-4">
            <p className="text-sm text-[#71717a]">Total Items</p>
            <p className="text-2xl font-bold text-[#242424]">{consumables.length}</p>
          </div>
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-4">
            <p className="text-sm text-[#71717a]">In Stock</p>
            <p className="text-2xl font-bold text-green-600">{inStockCount}</p>
          </div>
          <div className="bg-white border border-[#e4e4e7] rounded-lg p-4">
            <p className="text-sm text-[#71717a]">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
              <tr>
                <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Model</th>
                <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Location</th>
                <th className="text-center text-xs font-medium text-[#71717a] px-4 py-3 w-20">Qty</th>
                <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Status</th>
                <th className="text-center text-xs font-medium text-[#71717a] px-4 py-3 w-24">+/-</th>
                <th className="text-right text-xs font-medium text-[#71717a] px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {consumables.map((item) => {
                const status = item.quantity === 0 ? "empty" : item.quantity <= item.low_stock_threshold ? "low" : "ok";
                
                return (
                  <tr key={item.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f4f4f5] rounded-lg">
                          <Package className="w-4 h-4 text-[#71717a]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#242424]">{item.model?.name || "Unknown"}</p>
                          <p className="text-xs text-[#71717a]">{item.model?.brand} · {item.model?.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#242424]">
                      {item.location?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#242424] text-center">
                      {item.quantity}
                      {item.unit_type && <span className="text-xs text-[#71717a] ml-1">({item.unit_type})</span>}
                    </td>
                    <td className="px-4 py-3">
                      {status === "empty" && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                          Empty
                        </span>
                      )}
                      {status === "low" && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                          Low Stock
                        </span>
                      )}
                      {status === "ok" && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleAdjust(item.id, -1)}
                          disabled={adjustingId === item.id || item.quantity === 0}
                          className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAdjust(item.id, 1)}
                          disabled={adjustingId === item.id}
                          className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {adjustingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingConsumable(item)}
                          className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingConsumable(item)}
                          className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {consumables.length === 0 && (
            <div className="text-center py-8 text-[#71717a]">
              No consumables found
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <AddConsumableModal 
          categories={categories}
          subcategories={subcategories}
          models={models}
          locations={locations}
          suppliers={suppliers}
          onClose={() => {
            setShowAddModal(false);
            refreshConsumables();
          }}
        />
      )}

      {editingConsumable && (
        <EditConsumableModal
          consumable={editingConsumable}
          categories={categories}
          subcategories={subcategories}
          models={models}
          locations={locations}
          onClose={() => setEditingConsumable(null)}
          onSave={refreshConsumables}
        />
      )}

      {deletingConsumable && (
        <DeleteConsumableModal
          consumable={deletingConsumable}
          onClose={() => setDeletingConsumable(null)}
          onDeleted={refreshConsumables}
        />
      )}
    </div>
  );
}