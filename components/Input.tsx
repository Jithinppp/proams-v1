import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-[#898989] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 bg-white border border-[#e4e4e7] rounded-lg text-sm text-[#242424] 
              placeholder:text-[#a1a1aa] outline-none transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${
                error
                  ? "border-red-500 hover:border-red-500 focus:border-red-500"
                  : "hover:border-[#d4d4d8] focus:border-[#a1a1aa] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(161,161,170,0.3),rgba(19,19,22,0.7)_0px_1px_5px_-4px,rgba(34,42,53,0.05)_0px_4px_8px_0px]"
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
