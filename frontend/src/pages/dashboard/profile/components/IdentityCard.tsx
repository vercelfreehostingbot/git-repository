import { CircleUserRound, Camera, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { TFunction } from "i18next";
import type { User } from "../../../../redux/features/api/authApi/types";

interface IdentityCardProps {
  t: TFunction;
  user: User | null;
  joinedLabel: string;
  lastLoginLabel: string;
}

export function IdentityCard({ t, user, joinedLabel, lastLoginLabel }: IdentityCardProps) {
  const roleLabel = user?.role === "ADMIN" ? t("roleAdmin") : t("roleOperator");

  return (
    <div className="h-fit rounded-[14px] border border-surface-border bg-surface p-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
            <CircleUserRound size={52} color="white" strokeWidth={1.5} />
          </div>
          {/* Placeholder for future avatar upload — non-functional for
              now. */}
          <button
            type="button"
            aria-label={t("changePhoto")}
            className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-surface text-text-secondary shadow-sm transition hover:bg-header-row-bg"
            onClick={() => toast.info(t("common:comingSoon"))}
          >
            <Camera size={13} />
          </button>
        </div>

        <div className="text-[16px] font-extrabold text-text-primary">{user?.name ?? "..."}</div>
        <div className="mt-0.5 text-[13px] text-text-secondary">{user?.email}</div>

        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-soft-bg px-3 py-1 text-[12px] font-bold text-success-soft-text">
          <CheckCircle2 size={13} />
          {roleLabel}
        </span>
      </div>

      <div className="my-5 border-t border-surface-border" />

      <div className="flex flex-col gap-3 text-[13px] text-text-secondary">
        <div className="flex items-start gap-2.5">
          <CalendarDays size={15} className="mt-0.5 shrink-0 text-text-secondary" />
          {t("joined", { date: joinedLabel })}
        </div>
        <div className="flex items-start gap-2.5">
          <Clock size={15} className="mt-0.5 shrink-0 text-text-secondary" />
          {t("lastLogin", { time: lastLoginLabel })}
        </div>
      </div>
    </div>
  );
}