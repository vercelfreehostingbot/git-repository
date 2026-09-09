import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Spinner } from "../common/spinner/Spinner";

type ButtonVariant = "primary" | "primarySoft" | "secondary" | "danger" | "dangerSolid" | "success" | "info" | "accent";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  className?: string;
  children?: ReactNode;
}

const BASE =
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: `${BASE} rounded-[9px] bg-primary px-5.5 py-2.5 text-[13.5px] text-white hover:bg-primary-hover`,
  primarySoft: `${BASE} rounded-[9px] border border-primary-soft-border bg-primary-soft-bg px-5.5 py-2.5 text-[13.5px] text-primary-soft-text hover:bg-primary-soft-bg-hover`,
  secondary: `${BASE} rounded-[9px] border-[1.5px] border-surface-border bg-surface px-5.5 py-2.5 text-[13.5px] font-semibold text-text-secondary hover:bg-hover-bg`,
  danger: `${BASE} rounded-[9px] border border-danger-soft-border bg-danger-soft-bg px-5.5 py-2.5 text-[13.5px] text-danger-soft-text hover:bg-danger-soft-bg-hover`,
  dangerSolid: `${BASE} rounded-[9px] bg-danger px-5 py-2.5 text-[13.5px] text-white hover:bg-danger-hover`,
  success: `${BASE} rounded-[9px] border border-success-soft-border bg-success-soft-bg px-5.5 py-2.5 text-[13.5px] text-success-soft-text hover:bg-success-soft-bg-hover`,
  info: `${BASE} rounded-[9px] border border-info-soft-border bg-info-soft-bg px-5.5 py-2.5 text-[13.5px] text-info-soft-text hover:bg-info-soft-bg-hover`,
  accent: `${BASE} rounded-[9px] border border-accent-soft-border bg-accent-soft-bg px-5.5 py-2.5 text-[13.5px] text-accent-soft-text hover:bg-accent-soft-bg-hover`,
};

export function Button({
  variant = "primary",
  isLoading = false,
  icon,
  iconOnly = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const shapeClass = iconOnly ? "h-9 w-9 !px-0 !py-0" : "";

  return (
    <button
      className={`${VARIANTS[variant]} ${shapeClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <Spinner size="h-4 w-4" /> : icon}
      {!iconOnly && children}
    </button>
  );
}