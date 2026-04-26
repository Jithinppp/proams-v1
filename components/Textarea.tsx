import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, name, ...props }, ref) => {
    const textareaId = id || name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium uppercase tracking-wider text-[#898989] mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          className={`
            w-full px-4 py-3 bg-white border border-[#e4e4e7] rounded-lg text-sm text-[#242424] 
            placeholder:text-[#a1a1aa] outline-none transition-all duration-200
            focus:border-[#a1a1aa] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(161,161,170,0.3),rgba(19,19,22,0.7)_0px_1px_5px_-4px,rgba(34,42,53,0.05)_0px_4px_8px_0px]
            disabled:opacity-50 disabled:cursor-not-allowed resize-none
            ${error ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.4),rgba(19,19,22,0.7)_0px_1px_5px_-4px,rgba(34,42,53,0.05)_0px_4px_8px_0px]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";