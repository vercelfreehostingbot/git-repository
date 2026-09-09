import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: ReactNode;
  className?: string;
}

export function SelectField({ label, value, onChange, options, icon, className }: SelectFieldProps) {
  const hasValue = value !== "" && value !== options[0]?.value;

  return (
    <div className={className}>
      <label className="mb-1.75 block text-[12.5px] font-bold text-text-secondary">{label}</label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full cursor-pointer appearance-none rounded-[9px] border-[1.5px] border-surface-border bg-surface py-2.5 ${
            icon ? "pl-8.5" : "pl-3"
          } pr-8 text-[13.5px] outline-none transition hover:bg-header-row-bg ${
            hasValue ? "text-text-primary" : "text-text-secondary"
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          strokeWidth={2}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </div>
  );
}