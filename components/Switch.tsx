import { InputHTMLAttributes, forwardRef } from "react";

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            {...props}
          />
          <div
            className={`
              w-11 h-6 rounded-full transition-colors duration-200
              ${props.checked ? "bg-[#242424]" : "bg-[#e4e4e7]"}
            `}
          />
          <div
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
              ${props.checked ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </div>
        {label && <span className="text-sm text-[#242424]">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";