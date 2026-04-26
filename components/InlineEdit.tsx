"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "./Input";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  validation?: (value: string) => string | undefined;
  placeholder?: string;
  className?: string;
}

export function InlineEdit({
  value,
  onSave,
  validation,
  placeholder,
  className = "",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(value);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    const validationError = validation?.(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          error={error || undefined}
          className="h-8 text-sm"
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-xs text-green-600 hover:text-green-700 font-medium"
        >
          {isSaving ? "..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="text-xs text-gray-500 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group cursor-pointer ${className}`}>
      <span
        onClick={handleStartEdit}
        className="text-sm text-[#242424] hover:text-[#898989] transition-colors"
      >
        {value || placeholder}
      </span>
      <button
        onClick={handleStartEdit}
        className="opacity-0 group-hover:opacity-100 text-[#898989] hover:text-[#242424] transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>
    </div>
  );
}