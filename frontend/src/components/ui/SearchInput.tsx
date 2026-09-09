import { Search } from "lucide-react";
import { Button } from "./Button";

interface SearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
  searchLabel: string;
  isSearching?: boolean;
  className?: string;
}

export function SearchInput({
  label,
  value,
  onChange,
  onSearch,
  placeholder,
  searchLabel,
  isSearching = false,
  className,
}: SearchInputProps) {
  return (
    <div className={className}>
      <label className="mb-1.75 block text-[12.5px] font-bold text-text-secondary">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            placeholder={placeholder}
            className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border py-2.5 pl-8.5 pr-3 text-[13.5px] text-text-primary outline-none transition"
          />
        </div>
        <Button
          onClick={onSearch}
          isLoading={isSearching}
          disabled={isSearching}
          aria-label={searchLabel}
          icon={<Search size={15} strokeWidth={2.25} />}
          className="shrink-0"
        >
          {searchLabel}
        </Button>
      </div>
    </div>
  );
}