// Kept deliberately minimal — most colors are applied via Tailwind
// classes (bg-primary, text-text-secondary, border-surface-border,
// etc.) referencing the @theme tokens in index.css directly. This
// file only exports what genuinely MUST be a literal JS value rather
// than a className: props like TakaIcon's `color` (applied via an
// internal inline style) and StatCard's `iconBg` (same reason).
export const COLORS = {
  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  primary: "var(--color-primary)",
  danger: "var(--color-danger)",
  success: "var(--color-success)",
  info: "var(--color-info)",
  accent: "var(--color-accent)",
  orange: "var(--color-orange)",
} as const;

export const AVATAR_PALETTE: string[] = [
  "var(--color-avatar-1)",
  "var(--color-avatar-2)",
  "var(--color-avatar-3)",
  "var(--color-avatar-4)",
  "var(--color-avatar-5)",
];