import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string | null;
  icon: ReactNode;
  // Literal CSS color value (e.g. COLORS.primary) — kept as a prop
  // since it's applied via inline style, not a className, so each
  // page can pass whichever semantic color fits that card.
  iconBg: string;
  // Test/experiment only — when provided, colors the WHOLE card
  // background (not just the icon-badge) using this same value, with
  // white text for contrast. Optional and backward-compatible: pages
  // that don't pass this keep the existing white-card look untouched.
  cardBg?: string;
  valuePrefixIcon?: ReactNode;
  locale?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconBg,
  cardBg,
  valuePrefixIcon,
  locale = "en-GB",
}: StatCardProps) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString(locale) : value;

  return (
    <div
      className={`flex items-center gap-4 rounded-[14px] p-5 ${
        cardBg ? "" : "border border-surface-border bg-surface"
      }`}
      style={cardBg ? { background: cardBg } : undefined}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: cardBg ? "rgba(255,255,255,0.22)" : iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-[13px] font-semibold ${cardBg ? "text-white/85" : "text-text-secondary"}`}>
          {label}
        </div>
        <div
          className={`mt-0.5 flex items-center gap-0 text-[21px] font-extrabold ${
            cardBg ? "text-white" : "text-text-primary"
          }`}
        >
          {value === null ? (
            "—"
          ) : (
            <>
              {valuePrefixIcon}
              {displayValue}
            </>
          )}
        </div>
      </div>
    </div>
  );
}