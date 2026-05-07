"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./Input";
import { Button } from "./Button";
import { deleteKit } from "@/lib/actions/kits";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface Kit {
  id: string;
  name: string;
  description: string | null;
}

interface DeleteKitModalProps {
  kit: Kit;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteKitModal({ kit, onClose, onDeleted }: DeleteKitModalProps) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    const result = await deleteKit(kit.id);

    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    if (onDeleted) {
      onDeleted();
    }
    router.push("/inv/kits");
  };

  const isConfirmValid = confirmName === kit.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-[#242424]">
              Delete Kit
            </h2>
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

        <div className="bg-[#f4f4f5] rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-[#242424]">{kit.name}</p>
          {kit.description && (
            <p className="text-xs text-[#71717a]">{kit.description}</p>
          )}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700 mb-3">
            This action cannot be undone. To confirm, type the kit name below:
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={`Type "${kit.name}" to confirm`}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            loading={isDeleting}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}