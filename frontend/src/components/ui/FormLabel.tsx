import type { ReactNode } from "react";

interface FormLabelProps {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  asteriskSize?: string;
}

export function FormLabel({
  children,
  required = false,
  htmlFor,
  asteriskSize = "text-[15px]",
}: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-[7px] block text-[12.5px] font-bold text-text-secondary">
      {children}{" "}
      {required && (
        <span className={`${asteriskSize} leading-none text-danger`}>*</span>
      )}
    </label>
  );
}