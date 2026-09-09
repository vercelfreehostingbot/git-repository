import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Bell, FileText, Receipt } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useGetIncomePendingCountQuery } from "../../redux/features/incomeVouchers/incomeVouchersApi";
import { useGetExpensePendingCountQuery } from "../../redux/features/expenseVouchers/expenseVouchersApi";
import { useAppSelector } from "../../redux/app/hooks";
import { getIntlLocale } from "../../utils/locale";

const POLL_INTERVAL_MS = 30_000;
const DROPDOWN_WIDTH = 288; // matches the box's own w-72
const VIEWPORT_MARGIN = 16; // minimum gap kept from either screen edge

export function NotificationBell() {
  const { t, i18n } = useTranslation(["common"]);
  const intlLocale = getIntlLocale(i18n.language);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Actual measured pixel position for the dropdown — computed fresh
  // every time it opens (see useLayoutEffect below), rather than
  // guessed via CSS anchoring. This is what makes it reliable
  // regardless of where the bell actually renders on any given
  // screen-size/page-layout (right-aligned on desktop, centered on
  // mobile, or anything else): we measure the real DOM position and
  // clamp it to fit within the viewport, instead of assuming it.
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const { data: incomeData } = useGetIncomePendingCountQuery(undefined, {
    skip: !isAdmin,
    pollingInterval: POLL_INTERVAL_MS,
  });
  const { data: expenseData } = useGetExpensePendingCountQuery(undefined, {
    skip: !isAdmin,
    pollingInterval: POLL_INTERVAL_MS,
  });

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const idealLeft = rect.left + rect.width / 2 - DROPDOWN_WIDTH / 2;
    const maxLeft = window.innerWidth - DROPDOWN_WIDTH - VIEWPORT_MARGIN;
    const clampedLeft = Math.max(VIEWPORT_MARGIN, Math.min(idealLeft, maxLeft));

    setDropdownPos({ top: rect.bottom + 8, left: clampedLeft });
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAdmin) return null;

  const incomeCount = incomeData?.count ?? 0;
  const expenseCount = expenseData?.count ?? 0;
  const totalCount = incomeCount + expenseCount;

  function goTo(path: string) {
    setIsOpen(false);
    navigate(path);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t("notifications")}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface text-text-secondary shadow-sm transition hover:bg-surface-border"
      >
        <Bell size={24} />
        {totalCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {totalCount > 99 ? `${(99).toLocaleString(intlLocale)}+` : totalCount.toLocaleString(intlLocale)}
          </span>
        )}
      </button>

      {dropdownPos && (
        <div
          style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: DROPDOWN_WIDTH }}
          className={`z-[60] origin-top overflow-hidden rounded-[12px] border border-surface-border bg-surface shadow-xl transition duration-150 ease-out ${
            isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <div className="border-b border-surface-border px-4 py-3 text-[13.5px] font-bold text-text-primary">
            {t("notifications")}
          </div>

          {totalCount === 0 ? (
            <div className="px-4 py-6 text-center text-[12.5px] text-text-secondary">
              {t("noPendingApprovals")}
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {incomeCount > 0 && (
                <button
                  type="button"
                  onClick={() => goTo("/dashboard/accounts/income-vouchers?status=PENDING")}
                  className="flex cursor-pointer items-center gap-3 rounded-[9px] px-3 py-2.5 text-left transition hover:bg-hover-bg"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-soft-bg text-warning-soft-text">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-text-primary">
                      {t("pendingIncomeVouchers", { count: incomeCount.toLocaleString(intlLocale) })}
                    </div>
                    <div className="text-[11.5px] text-text-secondary">{t("clickToReview")}</div>
                  </div>
                </button>
              )}

              {expenseCount > 0 && (
                <button
                  type="button"
                  onClick={() => goTo("/dashboard/accounts/expense-vouchers?status=PENDING")}
                  className="flex cursor-pointer items-center gap-3 rounded-[9px] px-3 py-2.5 text-left transition hover:bg-hover-bg"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-soft-bg text-warning-soft-text">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-text-primary">
                      {t("pendingExpenseVouchers", { count: expenseCount.toLocaleString(intlLocale) })}
                    </div>
                    <div className="text-[11.5px] text-text-secondary">{t("clickToReview")}</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}