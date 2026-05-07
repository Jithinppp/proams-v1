"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Navbar, Button, Input } from "@/components";
import { ArrowLeft, Plus, Pencil, Trash2, Search, X, AlertTriangle } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  rating: number | null;
}

interface SuppliersListProps {
  suppliers: Supplier[];
}

export function SuppliersList({ suppliers: initialSuppliers }: SuppliersListProps) {
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    notes: "",
    rating: 3,
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Invalid website URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      notes: "",
      rating: 3,
    });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      contact_name: supplier.contact_name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      website: supplier.website || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
      rating: supplier.rating || 3,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    if (editingSupplier) {
      const { error } = await supabase
        .from("suppliers")
        .update({
          name: formData.name,
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          address: formData.address || null,
          notes: formData.notes || null,
          rating: formData.rating,
        })
        .eq("id", editingSupplier.id);

      if (!error) {
        setSuppliers(
          suppliers.map((s) =>
            s.id === editingSupplier.id
              ? { ...s, ...formData, contact_name: formData.contact_name || null }
              : s
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          name: formData.name,
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          address: formData.address || null,
          notes: formData.notes || null,
          rating: formData.rating,
        })
        .select()
        .single();

      if (!error && data) {
        setSuppliers([data, ...suppliers]);
      }
    }

    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== deletingSupplier?.name) return;
    setSaving(true);

    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", deletingSupplier!.id);

    if (!error) {
      setSuppliers(suppliers.filter((s) => s.id !== deletingSupplier!.id));
    }

    setSaving(false);
    setDeletingSupplier(null);
    setDeleteConfirm("");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#e4e4e7] rounded-lg text-sm"
          />
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
            <tr>
              <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">
                Name
              </th>
              <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">
                Contact
              </th>
              <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">
                Email
              </th>
              <th className="text-left text-sm font-medium text-[#71717a] px-4 py-3">
                Phone
              </th>
              <th className="text-right text-sm font-medium text-[#71717a] px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="border-b border-[#e4e4e7] last:border-0"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-[#242424]">{supplier.name}</span>
                </td>
                <td className="px-4 py-3 text-[#71717a]">
                  {supplier.contact_name || "-"}
                </td>
                <td className="px-4 py-3 text-[#71717a]">{supplier.email || "-"}</td>
                <td className="px-4 py-3 text-[#71717a]">{supplier.phone || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(supplier)}
                      className="p-1 hover:bg-[#f4f4f5] rounded"
                    >
                      <Pencil className="w-4 h-4 text-[#71717a]" />
                    </button>
                    <button
                      onClick={() => setDeletingSupplier(supplier)}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSuppliers.length === 0 && (
          <div className="p-8 text-center text-[#71717a]">
            {search ? "No suppliers found" : "No suppliers yet"}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#242424]">
                {editingSupplier ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[#f4f4f5] rounded-lg"
              >
                <X className="w-5 h-5 text-[#898989]" />
              </button>
            </div>

            <div className="space-y-4">
              {errors.name && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {errors.name}
                </div>
              )}

              <Input
                label="Supplier Name *"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                error={errors.name}
                placeholder="e.g., B&H Photo, Adorama"
              />

              <Input
                label="Contact Name"
                value={formData.contact_name}
                onChange={(e) =>
                  setFormData({ ...formData, contact_name: e.target.value })
                }
                placeholder="Contact person name"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  error={errors.email}
                  placeholder="email@example.com"
                />

                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  error={errors.phone}
                  placeholder="+1 555-000-0000"
                />
              </div>

              <Input
                label="Website"
                value={formData.website}
                onChange={(e) => {
                  setFormData({ ...formData, website: e.target.value });
                  if (errors.website) setErrors({ ...errors, website: "" });
                }}
                error={errors.website}
                placeholder="https://..."
              />

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Full address"
              />

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#898989] mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-2xl ${
                        star <= formData.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={!formData.name.trim()}
                  className="flex-1"
                >
                  {editingSupplier ? "Save Changes" : "Add Supplier"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeletingSupplier(null)}
          />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-xl mx-4">
            <div className="flex items-center justify-between pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-[#242424]">
                  Delete Supplier
                </h2>
              </div>
              <button
                onClick={() => setDeletingSupplier(null)}
                className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#71717a]" />
              </button>
            </div>

            <div className="bg-[#f4f4f5] rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-[#242424]">{deletingSupplier.name}</p>
              {deletingSupplier.contact_name && (
                <p className="text-xs text-[#71717a]">{deletingSupplier.contact_name}</p>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 mb-3">
                This action cannot be undone. To confirm, type the supplier name below:
              </p>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={`Type "${deletingSupplier.name}" to confirm`}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingSupplier(null)}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteConfirm !== deletingSupplier.name || saving}
                loading={saving}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}