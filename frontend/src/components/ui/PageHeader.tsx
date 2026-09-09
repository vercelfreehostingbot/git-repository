import type { ReactNode } from "react";
import { NotificationBell } from "./NotificationBell";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
      <div>
        <h1 className="text-[24px] font-extrabold text-text-primary">{title}</h1>
        <p className="mt-1 text-[13px] text-text-secondary">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:justify-start sm:gap-4">
        <NotificationBell />
        {action}
      </div>
    </div>
  );
}