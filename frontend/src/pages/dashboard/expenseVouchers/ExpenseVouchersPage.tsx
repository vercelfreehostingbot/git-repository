import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useSearchParams } from "react-router";
import { Eye, Pencil, Trash2, Download, Printer, FileText, RotateCcw, Plus, FileBarChart2, CircleDot, CheckCircle2, XCircle } from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { SelectField } from "../../../components/ui/SelectField";
import { DateRangePicker, type DateRange } from "../../../components/ui/DateRangePicker";
import { DataTable, type DataTableColumn } from "../../../components/ui/DataTable";
import { Pagination } from "../../../components/ui/Pagination";
import { DetailModal } from "../../../components/ui/DetailModal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { TakaIcon } from "../../../components/ui/TakaIcon";
import { COLORS } from "../../../styles/colors";
import { formatDate } from "../../../utils/formatDate";
import { getIntlLocale } from "../../../utils/locale";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { useAppSelector } from "../../../redux/app/hooks";
import { CreateEditExpenseVoucherModal } from "./components/CreateEditExpenseVoucherModal";
import {
  useDeleteExpenseVoucherMutation,
  useGetExpenseVoucherStatsQuery,
  useGetExpenseVouchersQuery,
  useLazyDownloadExpenseVoucherPdfQuery,
  useLazyDownloadExpenseVoucherSummaryPdfQuery,
  useApproveExpenseVoucherMutation,
  useRejectExpenseVoucherMutation,
} from "../../../redux/features/expenseVouchers/expenseVouchersApi";
import type { ExpenseVoucher, VoucherStatus } from "../../../redux/features/expenseVouchers/types";
import { toast } from "sonner";

type StatusFilter = "all" | VoucherStatus;

const STATUS_BADGE_CLASS: Record<VoucherStatus, string> = {
  PENDING: "bg-warning-soft-bg text-warning-soft-text",
  APPROVED: "bg-success-soft-bg text-success-soft-text",
  REJECTED: "bg-danger-soft-bg text-danger-soft-text",
};

export default function ExpenseVouchersPage() {
  const { t, i18n } = useTranslation("expenseVouchers");
  const intlLocale = getIntlLocale(i18n.language);
  useDocumentTitle(t("title"));
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  // ---- Filters ----
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  // Picks up ?status=PENDING when arriving via the notification-bell's
  // dropdown link, so the list opens pre-filtered without the user
  // having to manually select the filter themselves. Read directly via
  // useState's lazy initializer (runs once, during the first render)
  // rather than an effect — this value is only ever needed on mount,
  // so a synchronous setState-in-effect would just cause an avoidable
  // extra render (React's own guidance: derive-on-init instead of
  // effect+setState for this exact "read once from an external source
  // at mount" case).
  const [searchParams] = useSearchParams();
  const initialStatus = ((): StatusFilter => {
    const fromUrl = searchParams.get("status");
    return fromUrl === "PENDING" || fromUrl === "APPROVED" || fromUrl === "REJECTED" ? fromUrl : "all";
  })();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>(initialStatus);

  // ---- Pagination ----
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Handles the case where the user is ALREADY on this page and clicks
  // a notification-bell link pointing back to it with a different
  // ?status= — React Router doesn't remount the component for a
  // same-route navigation (only the lazy-initializer above ran, once,
  // at true first-mount), so without this the filter would silently
  // stay on whatever it was already showing. Same render-body
  // comparison technique as prevIsFetching below (React's documented
  // pattern for "adjusting state when a prop changes") rather than a
  // useEffect — calling setState directly inside an effect body is
  // what React's own lint rule now flags.
  const [prevUrlStatus, setPrevUrlStatus] = useState(searchParams.get("status"));
  const currentUrlStatus = searchParams.get("status");
  if (currentUrlStatus !== prevUrlStatus) {
    setPrevUrlStatus(currentUrlStatus);
    const nextStatus: StatusFilter =
      currentUrlStatus === "PENDING" || currentUrlStatus === "APPROVED" || currentUrlStatus === "REJECTED"
        ? currentUrlStatus
        : "all";
    setStatusFilter(nextStatus);
    setAppliedStatus(nextStatus);
    setPage(1);
  }

  const toApiDate = (d: Date | null) => {
    if (!d) return undefined;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetExpenseVouchersQuery({
    page,
    limit,
    search: appliedSearch || undefined,
    dateFrom: toApiDate(dateRange.start),
    dateTo: toApiDate(dateRange.end),
    status: appliedStatus === "all" ? undefined : appliedStatus,
  });

  const { data: stats, isLoading: isStatsLoading } = useGetExpenseVoucherStatsQuery();

  const vouchers = data?.vouchers ?? [];
  const meta = data?.meta;
  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  const [isSearchPending, setIsSearchPending] = useState(false);
  const [prevIsFetching, setPrevIsFetching] = useState(isFetching);
  if (isFetching !== prevIsFetching) {
    setPrevIsFetching(isFetching);
    if (!isFetching) setIsSearchPending(false);
  }

  const applySearch = () => {
    if (search === appliedSearch) {
      setIsSearchPending(true);
      if (page !== 1) {
        setPage(1);
      } else {
        refetch();
      }
      return;
    }
    setIsSearchPending(true);
    setAppliedSearch(search);
    setPage(1);
  };

  const changeStatusFilter = (value: string) => {
    const next = value as StatusFilter;
    setStatusFilter(next);
    setAppliedStatus(next);
    setPage(1);
  };

  const resetFilter = () => {
    setSearch("");
    setAppliedSearch("");
    setDateRange({ start: null, end: null });
    setStatusFilter("all");
    setAppliedStatus("all");
    setPage(1);
  };

  const changeLimit = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  // ---- Create / Edit modal ----
  const [formOpen, setFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<ExpenseVoucher | null>(null);

  const openCreate = () => {
    setEditingVoucher(null);
    setFormOpen(true);
  };
  const openEdit = (voucher: ExpenseVoucher) => {
    setEditingVoucher(voucher);
    setFormOpen(true);
  };

  // ---- View modal ----
  const [viewingVoucher, setViewingVoucher] = useState<ExpenseVoucher | null>(null);

  // ---- Delete ----
  const [deletingVoucher, setDeletingVoucher] = useState<ExpenseVoucher | null>(null);
  const [deleteVoucher, { isLoading: isDeleting }] = useDeleteExpenseVoucherMutation();

  const confirmDelete = async () => {
    if (!deletingVoucher) return;
    try {
      await deleteVoucher(deletingVoucher.id).unwrap();
      toast.success(t("toast.voucherDeleted"));
      setDeletingVoucher(null);
    } catch (err) {
      toast.error(getErrorMessage(err as never));
    }
  };

  // ---- Approve / Reject ----
  const [approveVoucher, { isLoading: isApproving }] = useApproveExpenseVoucherMutation();
  const [rejectVoucher, { isLoading: isRejecting }] = useRejectExpenseVoucherMutation();

  const handleApprove = async (voucher: ExpenseVoucher) => {
    try {
      await approveVoucher(voucher.id).unwrap();
      toast.success(t("toast.voucherApproved"));
      setViewingVoucher(null);
    } catch (err) {
      toast.error(getErrorMessage(err as never));
    }
  };

  const handleReject = async (voucher: ExpenseVoucher) => {
    try {
      await rejectVoucher(voucher.id).unwrap();
      toast.success(t("toast.voucherRejected"));
      setViewingVoucher(null);
    } catch (err) {
      toast.error(getErrorMessage(err as never));
    }
  };

  // ---- Summary PDF ----
  const [triggerSummaryPdf] = useLazyDownloadExpenseVoucherSummaryPdfQuery();
  const [isDownloadingSummary, setIsDownloadingSummary] = useState(false);
  const [isPrintingSummary, setIsPrintingSummary] = useState(false);

  const summaryPdfParams = {
    search: appliedSearch || undefined,
    dateFrom: toApiDate(dateRange.start),
    dateTo: toApiDate(dateRange.end),
  };

  const handleDownloadSummaryPdf = async () => {
    setIsDownloadingSummary(true);
    try {
      const blob = await triggerSummaryPdf(summaryPdfParams).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expense-vouchers-summary.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err as never));
    } finally {
      setIsDownloadingSummary(false);
    }
  };

  const handlePrintSummaryPdf = async () => {
    setIsPrintingSummary(true);
    try {
      const blob = await triggerSummaryPdf(summaryPdfParams).unwrap();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      printWindow?.addEventListener("load", () => printWindow.print());
    } catch (err) {
      toast.error(getErrorMessage(err as never));
    } finally {
      setIsPrintingSummary(false);
    }
  };

  // ---- PDF download ----
  const [triggerDownloadPdf] = useLazyDownloadExpenseVoucherPdfQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  const handleDownloadPdf = async (voucher: ExpenseVoucher) => {
    setDownloadingId(voucher.id);
    try {
      const blob = await triggerDownloadPdf(voucher.id).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${voucher.voucherNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err as never));
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePrintPdf = async (voucher: ExpenseVoucher) => {
    setPrintingId(voucher.id);
    try {
      const blob = await triggerDownloadPdf(voucher.id).unwrap();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      printWindow?.addEventListener("load", () => printWindow.print());
    } catch (err) {
      toast.error(getErrorMessage(err as never));
    } finally {
      setPrintingId(null);
    }
  };

  const statusOptions = [
    { value: "all", label: t("filter.allStatuses") },
    { value: "PENDING", label: t("filter.pending") },
    { value: "APPROVED", label: t("filter.approved") },
    { value: "REJECTED", label: t("filter.rejected") },
  ];

  const statusLabel = (status: VoucherStatus) =>
    status === "PENDING" ? t("filter.pending") : status === "APPROVED" ? t("filter.approved") : t("filter.rejected");

  const columns: DataTableColumn<ExpenseVoucher>[] = [
    {
      key: "sl",
      header: t("table.sl"),
      render: (_row, index) => (
        <span className="text-text-secondary">{(from + index).toLocaleString(intlLocale)}</span>
      ),
    },
    {
      key: "voucherNo",
      header: t("table.voucherNo"),
      render: (v) => (
        <span className="whitespace-nowrap font-bold text-primary">{v.voucherNumber}</span>
      ),
    },
    {
      key: "date",
      header: t("table.date"),
      render: (v) => (
        <span className="whitespace-nowrap text-text-primary">{formatDate(v.date, intlLocale)}</span>
      ),
    },
    {
      key: "operator",
      header: t("table.operator"),
      render: (v) => (
        <span className="whitespace-nowrap text-text-primary">{v.createdBy.name}</span>
      ),
    },
    {
      key: "description",
      header: t("table.description"),
      render: (v) => (
        <span
          className="block max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-text-primary"
          title={v.description}
        >
          {v.description}
        </span>
      ),
    },
    {
      key: "source",
      header: t("table.source"),
      render: (v) => (
        <span
          className="block max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-text-primary"
          title={v.expenseHead}
        >
          {v.expenseHead}
        </span>
      ),
    },
    {
      key: "amount",
      header: t("table.amount"),
      render: (v) => (
        <span className="inline-flex items-center gap-0.5 whitespace-nowrap font-bold text-text-primary">
          <TakaIcon size={13} color="currentColor" />
          {v.amount.toLocaleString(intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "status",
      header: t("table.status"),
      render: (v) => (
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold ${STATUS_BADGE_CLASS[v.status]}`}
        >
          {statusLabel(v.status)}
        </span>
      ),
    },
    {
      key: "action",
      header: t("table.action"),
      align: "center",
      render: (v) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            iconOnly
            onClick={() => setViewingVoucher(v)}
            aria-label={t("actions.view")}
            icon={<Eye size={14} />}
          />
          {(isAdmin || v.status !== "APPROVED") && (
            <Button
              variant="info"
              iconOnly
              onClick={() => openEdit(v)}
              aria-label={t("actions.edit")}
              icon={<Pencil size={14} />}
            />
          )}
          {isAdmin && (
            <Button
              variant="danger"
              iconOnly
              onClick={() => setDeletingVoucher(v)}
              aria-label={t("actions.delete")}
              icon={<Trash2 size={14} />}
            />
          )}
          {v.status === "APPROVED" && (
            <>
              <Button
                variant="primarySoft"
                iconOnly
                onClick={() => handleDownloadPdf(v)}
                disabled={downloadingId === v.id}
                isLoading={downloadingId === v.id}
                aria-label={t("table.downloadPdf")}
                icon={<Download size={14} />}
              />
              <Button
                variant="success"
                iconOnly
                onClick={() => handlePrintPdf(v)}
                disabled={printingId === v.id}
                isLoading={printingId === v.id}
                aria-label={t("actions.print")}
                icon={<Printer size={14} />}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button onClick={openCreate} icon={<Plus size={15} />}>
            {t("newVoucher")}
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="mb-5 grid gap-4.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatCard
          label={t("stats.totalVouchers")}
          value={isLoading ? null : meta?.total ?? 0}
          iconBg={COLORS.primary}
          icon={<FileText size={24} color="white" strokeWidth={2} />}
          locale={intlLocale}
        />
        <StatCard
          label={t("stats.totalAmount")}
          value={isLoading ? null : (meta?.totalAmount ?? 0).toLocaleString(intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          iconBg={COLORS.success}
          icon={<TakaIcon size={24} color="white" />}
          valuePrefixIcon={<TakaIcon size={18} color={COLORS.textPrimary} />}
        />
        <StatCard
          label={t("stats.todayVouchers")}
          value={isStatsLoading ? null : stats?.todayVouchers ?? 0}
          iconBg={COLORS.info}
          icon={<FileText size={24} color="white" strokeWidth={2} />}
          locale={intlLocale}
        />
        <StatCard
          label={t("stats.todayAmount")}
          value={isStatsLoading ? null : (stats?.todayAmount ?? 0).toLocaleString(intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          iconBg={COLORS.accent}
          icon={<TakaIcon size={24} color="white" />}
          valuePrefixIcon={<TakaIcon size={18} color={COLORS.textPrimary} />}
        />
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-[14px] border border-surface-border bg-surface p-[18px_24px]">
        <SearchInput
          className="min-w-55 flex-1"
          label={t("search.label")}
          value={search}
          onChange={setSearch}
          onSearch={applySearch}
          placeholder={t("search.placeholder")}
          searchLabel={t("search.button")}
          isSearching={isSearchPending}
        />

        <DateRangePicker
          className="min-w-55 flex-1"
          label={t("filter.dateRange")}
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            setPage(1);
          }}
          placeholder={t("filter.selectDateRange")}
          modalTitle={t("dateRangeModal.title")}
          quickRanges={[
            { key: "today", label: t("dateRangeModal.today") },
            { key: "yesterday", label: t("dateRangeModal.yesterday") },
            { key: "last7", label: t("dateRangeModal.last7") },
            { key: "month", label: t("dateRangeModal.month") },
            { key: "lastmonth", label: t("dateRangeModal.lastmonth") },
            { key: "year", label: t("dateRangeModal.year") },
            { key: "lastyear", label: t("dateRangeModal.lastyear") },
            { key: "custom", label: t("dateRangeModal.custom") },
          ]}
          resetLabel={t("dateRangeModal.reset")}
          cancelLabel={t("dateRangeModal.cancel")}
          applyLabel={t("dateRangeModal.apply")}
          noDateSelectedLabel={t("dateRangeModal.noDateSelected")}
          fromLabel={t("dateRangeModal.from")}
          toLabel={t("dateRangeModal.to")}
          pickEndDateLabel={t("dateRangeModal.pickEndDate")}
          daysSuffix={(n) => t("dateRangeModal.days", { count: n })}
          locale={intlLocale}
        />

        <SelectField
          className="min-w-40 flex-1"
          label={t("filter.status")}
          value={statusFilter}
          onChange={changeStatusFilter}
          icon={<CircleDot size={14} />}
          options={statusOptions}
        />

        <Button variant="secondary" onClick={resetFilter} icon={<RotateCcw size={14} />}>
          {t("filter.reset")}
        </Button>
      </div>

      {/* Table + Pagination */}
      <div className="overflow-hidden rounded-[14px] border border-surface-border bg-surface">
        <DataTable
          columns={columns}
          data={vouchers}
          keyExtractor={(v) => v.id}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          errorMessage={getErrorMessage(error as never, t("errors.loadFailed"))}
          onRetry={refetch}
          retryLabel={t("errors.retry")}
          emptyMessage={t("table.noResults")}
          refreshingLabel={t("table.refreshing")}
          headerInfo={
            meta
              ? t("table.showingEntries", {
                  from: from.toLocaleString(intlLocale),
                  to: to.toLocaleString(intlLocale),
                  total: meta.total.toLocaleString(intlLocale),
                })
              : t("table.loading")
          }
          headerActions={
            <>
              <Button
                variant="primarySoft"
                onClick={handleDownloadSummaryPdf}
                isLoading={isDownloadingSummary}
                icon={<FileBarChart2 size={14} />}
                className="!px-3.5 !py-2 !text-[12.5px]"
              >
                {t("table.downloadSummary")}
              </Button>
              <Button
                variant="success"
                onClick={handlePrintSummaryPdf}
                isLoading={isPrintingSummary}
                icon={<Printer size={14} />}
                className="!px-3.5 !py-2 !text-[12.5px]"
              >
                {t("table.printSummary")}
              </Button>
            </>
          }
        />

        {!isError && (
          <Pagination
            page={meta?.page ?? 1}
            totalPages={meta?.totalPages ?? 1}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={changeLimit}
            limitOptions={[50, 75, 100]}
            showLabel={t("table.show")}
            entriesLabel={t("table.entries")}
            locale={intlLocale}
          />
        )}
      </div>

      {/* Create / Edit modal */}
      <CreateEditExpenseVoucherModal
        key={editingVoucher?.id ?? "create"}
        t={t}
        isOpen={formOpen}
        mode={editingVoucher ? "edit" : "create"}
        voucher={editingVoucher}
        onClose={() => setFormOpen(false)}
        onSaved={() => setPage(1)}
      />

      {/* View modal */}
      {viewingVoucher && (
        <DetailModal
          isOpen={!!viewingVoucher}
          onClose={() => setViewingVoucher(null)}
          title={t("detail.title")}
          closeLabel={t("detail.close")}
          footerActions={
            <>
              {/* Approve/Reject — only for Admins reviewing a still-PENDING
                  voucher. This is the SAME modal reached from both the
                  notification-bell's dropdown and a normal table row's
                  "View" click, so the behavior is identical regardless
                  of entry-point (see earlier design discussion). */}
              {isAdmin && viewingVoucher.status === "PENDING" && (
                <>
                  <Button
                    variant="dangerSolid"
                    onClick={() => handleReject(viewingVoucher)}
                    isLoading={isRejecting}
                    icon={<XCircle size={14} />}
                  >
                    {t("actions.reject")}
                  </Button>
                  <Button
                    onClick={() => handleApprove(viewingVoucher)}
                    isLoading={isApproving}
                    icon={<CheckCircle2 size={14} />}
                  >
                    {t("actions.approve")}
                  </Button>
                </>
              )}
              {viewingVoucher.status === "APPROVED" && (
                <>
                  <Button
                    variant="primarySoft"
                    onClick={() => handleDownloadPdf(viewingVoucher)}
                    isLoading={downloadingId === viewingVoucher.id}
                    icon={<Download size={14} />}
                  >
                    {t("table.downloadPdf")}
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handlePrintPdf(viewingVoucher)}
                    isLoading={printingId === viewingVoucher.id}
                    icon={<Printer size={14} />}
                  >
                    {t("actions.print")}
                  </Button>
                </>
              )}
            </>
          }
          fields={[
            { label: t("table.voucherNo"), value: viewingVoucher.voucherNumber },
            { label: t("table.date"), value: formatDate(viewingVoucher.date, intlLocale) },
            { label: t("table.operator"), value: viewingVoucher.createdBy.name },
            { label: t("table.source"), value: viewingVoucher.expenseHead },
            { label: t("form.reference"), value: viewingVoucher.reference },
            {
              label: t("table.amount"),
              value: (
                <span className="inline-flex items-center gap-0.5">
                  <TakaIcon size={14} color={COLORS.textPrimary} />
                  {viewingVoucher.amount.toLocaleString(intlLocale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              ),
            },
            { label: t("table.description"), value: viewingVoucher.description, fullWidth: true },
            {
              label: t("detail.createdAt"),
              value: new Date(viewingVoucher.createdAt).toLocaleString(intlLocale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              noBorder: true,
            },
            {
              label: t("table.status"),
              value: (
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${STATUS_BADGE_CLASS[viewingVoucher.status]}`}
                >
                  {statusLabel(viewingVoucher.status)}
                </span>
              ),
              noBorder: true,
            },
          ]}
        />
      )}

      {/* Delete confirmation */}
      {deletingVoucher && (
        <ConfirmDialog
          isOpen={!!deletingVoucher}
          onClose={() => setDeletingVoucher(null)}
          onConfirm={confirmDelete}
          title={t("delete.title")}
          message={
            <Trans
              t={t}
              i18nKey="delete.message"
              values={{ voucherNumber: deletingVoucher.voucherNumber }}
              components={{ bold: <b /> }}
            />
          }
          confirmLabel={t("delete.confirm")}
          cancelLabel={t("delete.cancel")}
          isConfirming={isDeleting}
        />
      )}
    </>
  );
}