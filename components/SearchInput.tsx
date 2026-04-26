import { Search, X } from "lucide-react";
import { InputHTMLAttributes, forwardRef } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ label, error, className = "", value, onChange, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-[#898989] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
          <input
            ref={ref}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`
              w-full pl-10 pr-10 py-2.5 bg-white border border-[#e4e4e7] rounded-lg text-sm text-[#242424] 
              placeholder:text-[#a1a1aa] outline-none transition-all duration-200
              focus:border-[#a1a1aa] focus:ring-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "border-red-500" : ""}
              ${className}
            `}
            {...props}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange?.({ target: { value: "" } } as any)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a1a1aa] hover:text-[#71717a] hover:bg-[#f4f4f5] rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";