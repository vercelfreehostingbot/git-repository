import { Spinner } from "../../../../components/common/spinner/Spinner";

interface StatusToggleCellProps {
  isActive: boolean;
  isUpdating: boolean;
  onToggle: () => void;
  activeLabel: string;
  inactiveLabel: string;
}

export function StatusToggleCell({
  isActive,
  isUpdating,
  onToggle,
  activeLabel,
  inactiveLabel,
}: StatusToggleCellProps) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={onToggle}
        disabled={isUpdating}
        aria-label={isActive ? inactiveLabel : activeLabel}
        className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50 ${
          isActive ? "bg-success" : "bg-toggle-off"
        } ${isUpdating ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        {/* justify-content can't be animated by CSS at all, which is
            why the knob used to jump instantly instead of sliding —
            transform: translateX() IS animatable, so this actually
            slides smoothly. */}
        <span
          className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            isActive ? "translate-x-[20px]" : "translate-x-0"
          }`}
        />
      </button>
      {isUpdating ? (
        <Spinner size="h-4 w-4" className="text-text-secondary" />
      ) : (
        <span
          className={`w-[52px] text-[12px] font-bold ${
            isActive ? "text-success-soft-text" : "text-text-secondary"
          }`}
        >
          {isActive ? activeLabel : inactiveLabel}
        </span>
      )}
    </div>
  );
}