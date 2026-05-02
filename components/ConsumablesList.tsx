"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, MapPin, Plus, Minus, AlertTriangle, CheckCircle } from "lucide-react";

export interface Consumable {
  id: string;
  model_id: string;
  location_id: string;
  quantity: number;
  low_stock_threshold: number;
  unit_type: string | null;
  updated_at: string;
  model?: {
    name: string;
    brand: string;
    code: string;
  } | null;
  location?: {
    name: string;
  } | null;
}

interface ConsumablesListProps {
  consumables: Consumable[];
  onAdjust: (id: string) => void;
}

export function ConsumablesList({ consumables, onAdjust }: ConsumablesListProps) {
  const getStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { status: "empty", color: "text-red-600", bg: "bg-red-100" };
    if (quantity <= threshold) return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { status: "ok", color: "text-green-600", bg: "bg-green-100" };
  };

  return (
    <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
          <tr>
            <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Model</th>
            <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Location</th>
            <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Quantity</th>
            <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Status</th>
            <th className="text-left text-xs font-medium text-[#71717a] px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4e4e7]">
          {consumables.map((item) => {
            const statusInfo = getStatus(item.quantity, item.low_stock_threshold);
            
            return (
              <tr key={item.id} className="hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f4f4f5] rounded-lg">
                      <Package className="w-4 h-4 text-[#71717a]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#242424]">
                        {item.model?.name || "Unknown Model"}
                      </p>
                      <p className="text-xs text-[#71717a]">
                        {item.model?.brand} · {item.model?.code}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-[#242424]">
                    <MapPin className="w-3 h-3 text-[#71717a]" />
                    {item.location?.name || "Unassigned"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#242424]">
                    {item.quantity}
                  </span>
                  {item.unit_type && (
                    <span className="text-xs text-[#71717a] ml-1">({item.unit_type})</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {statusInfo.status === "empty" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Empty
                    </span>
                  )}
                  {statusInfo.status === "low" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  )}
                  {statusInfo.status === "ok" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      In Stock
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAdjust(item.id)}
                      className="p-1.5 hover:bg-[#f4f4f5] rounded-lg text-[#71717a] hover:text-[#242424] transition-colors"
                      title="Adjust quantity"
                    >
                      <Package className="w-4 h-4" />
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
  );
}