"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "./Input";
import { Button } from "./Button";
import { Package, X, Minus, Plus, Loader2 } from "lucide-react";

interface QuickAdjustModalProps {
  consumable: {
    id: string;
    model_name: string;
    quantity: number;
    low_stock_threshold: number;
    unit_type: string | null;
  };
  onClose: () => void;
}

export function QuickAdjustModal({ consumable, onClose }: QuickAdjustModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [adjustment, setAdjustment] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const newQuantity = Math.max(0, consumable.quantity + adjustment);

  const handleAdjust = async (amount: number) => {
    if (amount === 0) return;
    
    const finalQuantity = Math.max(0, consumable.quantity + amount);
    
    setIsSubmitting(true);
    setError("");

    const { error: updateError } = await supabase
      .from("consumables")
      .update({ quantity: finalQuantity, updated_at: new Date().toISOString() })
      .eq("id", consumable.id);

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#242424]">Adjust Stock</h2>
              <p className="text-sm text-[#71717a]">{consumable.model_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-sm text-[#71717a] mb-2">Current Quantity</p>
            <p className="text-3xl font-bold text-[#242424]">
              {consumable.quantity}
              {consumable.unit_type && (
                <span className="text-lg font-normal text-[#71717a]"> {consumable.unit_type}</span>
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleAdjust(-10)}
              disabled={isSubmitting || (consumable.quantity + -10) < 0}
              className="p-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-lg text-sm font-medium text-[#242424] disabled:opacity-50"
            >
              -10
            </button>
            <button
              onClick={() => handleAdjust(-5)}
              disabled={isSubmitting || (consumable.quantity + -5) < 0}
              className="p-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-lg text-sm font-medium text-[#242424] disabled:opacity-50"
            >
              -5
            </button>
            <button
              onClick={() => handleAdjust(-1)}
              disabled={isSubmitting || (consumable.quantity + -1) < 0}
              className="p-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-lg disabled:opacity-50"
            >
              <Minus className="w-5 h-5 text-[#242424]" />
            </button>
            
            <div className="px-6 py-3 bg-[#f4f4f5] rounded-lg min-w-[80px] text-center">
              <span className="text-xl font-bold text-[#242424]">
                {Math.max(0, consumable.quantity + adjustment)}
              </span>
            </div>
            
            <button
              onClick={() => handleAdjust(1)}
              disabled={isSubmitting}
              className="p-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-lg disabled:opacity-50"
            >
              <Plus className="w-5 h-5 text-[#242424]" />
            </button>
            <button
              onClick={() => handleAdjust(5)}
              disabled={isSubmitting}
              className="p-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-lg text-sm font-medium text-[#242424] disabled:opacity-50"
            >
              +5
            </button>
            <button
              onClick={() => handleAdjust(10)}
              disabled={isSubmitting}
              className="p-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-lg text-sm font-medium text-[#242424] disabled:opacity-50"
            >
              +10
            </button>
          </div>

          {newQuantity !== consumable.quantity && (
            <p className="text-center text-sm text-[#71717a]">
              New quantity: <strong>{newQuantity}</strong>
            </p>
          )}

          {newQuantity <= consumable.low_stock_threshold && newQuantity > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 text-center">
              Warning: This will set quantity below low stock threshold ({consumable.low_stock_threshold})
            </div>
          )}

          {newQuantity === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 text-center">
              Warning: This will set quantity to 0 (empty)
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t border-[#e4e4e7]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}