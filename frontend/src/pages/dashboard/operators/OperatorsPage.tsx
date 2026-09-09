import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RotateCcw, Users, UserCheck, UserX, CircleDot, Plus } from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { SelectField } from "../../../components/ui/SelectField";
import { DataTable, type DataTableColumn } from "../../../components/ui/DataTable";
import { Pagination } from "../../../components/ui/Pagination";
import { ErrorBanner } from "../../../components/ui/ErrorBanner";
import { COLORS, AVATAR_PALETTE } from "../../../styles/colors";
import { formatDate } from "../../../utils/formatDate";
import { getIntlLocale } from "../../../utils/locale";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatusToggleCell } from "./components/StatusToggleCell";
import { CreateOperatorModal } from "./components/CreateOperatorModal";
import {
  useGetOperatorStatsQuery,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from "../../../redux/features/users/usersApi";
import type { Status, User } from "../../../redux/features/users/types";

type StatusFilter = "all" | "active" | "inactive";

export default function OperatorsPage() {
  const { t, i18n } = useTranslation("operators");
  const intlLocale = getIntlLocale(i18n.language);
  useDocumentTitle(t("title"));

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>("all");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const statusParam: Status | undefined =
    appliedStatus === "all" ? undefined : appliedStatus === "active" ? "ACTIVE" : "INACTIVE";

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetUsersQuery({
    role: "OPERATOR",
    page,
    limit,
    search: appliedSearch || undefined,
    status: statusParam,
  });

  const [isSearchPending, setIsSearchPending] = useState(false);
  const [prevIsFetching, setPrevIsFetching] = useState(isFetching);
  if (isFetching !== prevIsFetching) {
    setPrevIsFetching(isFetching);
    if (!isFetching) {
      setIsSearchPending(false);
    }
  }

  const { data: stats, isLoading: isStatsLoading } = useGetOperatorStatsQuery();

  const operators = data?.users ?? [];
  const meta = data?.meta;
  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  const [updateStatus] = useUpdateUserStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, current: Status) => {
    setToggleError(null);
    setUpdatingId(id);

    const wasLastFilteredItemOnPage = statusParam !== undefined && operators.length === 1 && page > 1;

    try {
      await updateStatus({ id, status: current === "ACTIVE" ? "INACTIVE" : "ACTIVE" }).unwrap();
      toast.success(t("toast.statusUpdated"));
      if (wasLastFilteredItemOnPage) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch (err) {
      setToggleError(getErrorMessage(err as never));
    } finally {
      setUpdatingId(null);
    }
  };

  const [formOpen, setFormOpen] = useState(false);

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
    setStatusFilter("all");
    setAppliedSearch("");
    setAppliedStatus("all");
    setPage(1);
  };

  const changeLimit = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const statusOptions = [
    { value: "all", label: t("filter.allStatuses") },
    { value: "active", label: t("filter.active") },
    { value: "inactive", label: t("filter.inactive") },
  ];

  const columns: DataTableColumn<User>[] = [
    {
      key: "sl",
      header: t("table.sl"),
      render: (_row, index) => (
        <span className="text-text-secondary">{(from + index).toLocaleString(intlLocale)}</span>
      ),
    },
    {
      key: "operator",
      header: t("table.operator"),
      render: (op, index) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold text-white"
            style={{ background: AVATAR_PALETTE[index % AVATAR_PALETTE.length] }}
          >
            {op.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[13.5px] font-bold text-text-primary">{op.name}</div>
            <div className="text-[12px] text-text-secondary">{op.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: t("table.role"),
      render: () => (
        <span className="rounded-full bg-info-soft-bg px-2.5 py-1 text-[12px] font-bold text-info-soft-text">
          {t("role.operator")}
        </span>
      ),
    },
    {
      key: "joined",
      header: t("table.joined"),
      render: (op) => <span className="text-text-primary">{formatDate(op.createdAt, intlLocale)}</span>,
    },
    {
      key: "status",
      header: t("table.status"),
      render: (op) => (
        <StatusToggleCell
          isActive={op.status === "ACTIVE"}
          isUpdating={updatingId === op.id}
          onToggle={() => handleToggleStatus(op.id, op.status)}
          activeLabel={t("filter.active")}
          inactiveLabel={t("filter.inactive")}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button onClick={() => setFormOpen(true)} icon={<Plus size={15} />}>
            {t("newOperator")}
          </Button>
        }
      />

      {toggleError && (
        <ErrorBanner message={toggleError} onDismiss={() => setToggleError(null)} variant="danger" />
      )}

      {/* Stat cards */}
      <div className="mb-5 grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatCard
          label={t("stats.total")}
          value={isStatsLoading ? null : stats?.totalOperators ?? 0}
          iconBg={COLORS.primary}
          icon={<Users size={24} color="white" strokeWidth={2} />}
          locale={intlLocale}
        />
        <StatCard
          label={t("stats.active")}
          value={isStatsLoading ? null : stats?.activeOperators ?? 0}
          iconBg={COLORS.success}
          icon={<UserCheck size={24} color="white" strokeWidth={2} />}
          locale={intlLocale}
        />
        <StatCard
          label={t("stats.inactive")}
          value={isStatsLoading ? null : stats?.inactiveOperators ?? 0}
          iconBg={COLORS.danger}
          icon={<UserX size={24} color="white" strokeWidth={2} />}
          locale={intlLocale}
        />
      </div>

      {/* Search + Filter row */}
      <div className="mb-5 flex flex-wrap gap-[18px]">
        <div className="flex min-w-[320px] flex-1 flex-wrap items-end gap-[14px] rounded-[14px] border border-surface-border bg-surface p-[22px_24px]">
          <SearchInput
            className="min-w-[220px] flex-1"
            label={t("search.label")}
            value={search}
            onChange={setSearch}
            onSearch={applySearch}
            placeholder={t("search.placeholder")}
            searchLabel={t("search.button")}
            isSearching={isSearchPending}
          />
        </div>

        <div className="flex min-w-[320px] flex-1 flex-wrap items-end gap-[18px] rounded-[14px] border border-surface-border bg-surface p-[22px_24px]">
          <SelectField
            className="min-w-[160px] flex-1"
            label={t("filter.status")}
            value={statusFilter}
            onChange={changeStatusFilter}
            icon={<CircleDot size={14} />}
            options={statusOptions}
          />

          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={resetFilter} icon={<RotateCcw size={14} />}>
              {t("filter.reset")}
            </Button>
          </div>
        </div>
      </div>

      {/* Table + Pagination — one continuous card */}
      <div className="overflow-hidden rounded-[14px] border border-surface-border bg-surface">
        <DataTable
          columns={columns}
          data={operators}
          keyExtractor={(op) => op.id}
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
        />

        {!isError && (
          <Pagination
            page={meta?.page ?? 1}
            totalPages={meta?.totalPages ?? 1}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={changeLimit}
            showLabel={t("table.show")}
            entriesLabel={t("table.entries")}
            locale={intlLocale}
          />
        )}
      </div>

      <CreateOperatorModal
        t={t}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={() => setPage(1)}
      />
    </>
  );
}