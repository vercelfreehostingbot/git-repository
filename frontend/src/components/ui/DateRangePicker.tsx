import { useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface QuickRangeOption {
  key: "today" | "yesterday" | "last7" | "month" | "lastmonth" | "year" | "lastyear" | "custom";
  label: string;
}

interface DateRangePickerProps {
  label: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
  placeholder: string;
  modalTitle: string;
  quickRanges: QuickRangeOption[];
  resetLabel: string;
  cancelLabel: string;
  applyLabel: string;
  noDateSelectedLabel: string;
  fromLabel: string;
  toLabel: string;
  pickEndDateLabel: string;
  daysSuffix: (days: number) => string;
  locale?: string;
  className?: string;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isInRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000) + 1;
}
function formatDisplayDate(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
}
function monthYearLabel(year: number, month: number, locale: string): string {
  return new Date(year, month, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
}
function weekdayHeaders(locale: string): string[] {
  const referenceSunday = new Date(2023, 0, 1);
  return Array.from({ length: 7 }, (_, i) =>
    new Date(referenceSunday.getFullYear(), referenceSunday.getMonth(), referenceSunday.getDate() + i)
      .toLocaleDateString(locale, { weekday: "short" })
      .slice(0, 2),
  );
}

interface CalendarCell {
  date: Date | null;
  label: string;
  kind: "filler" | "start" | "end" | "same" | "in-range" | "normal";
}

function buildCalendarCells(year: number, month: number, rangeStart: Date | null, rangeEnd: Date | null): CalendarCell[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ date: null, label: String(prevDays - i), kind: "filler" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isStart = isSameDay(date, rangeStart);
    const isEnd = isSameDay(date, rangeEnd);
    let kind: CalendarCell["kind"] = "normal";
    if (isStart && isEnd) kind = "same";
    else if (isStart) kind = "start";
    else if (isEnd) kind = "end";
    else if (isInRange(date, rangeStart, rangeEnd)) kind = "in-range";
    cells.push({ date, label: String(d), kind });
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, label: String(next++), kind: "filler" });
  }
  return cells;
}

// Maps each cell kind to its full className — colors sourced from
// @theme tokens (primary / primary-soft-*), no inline style.
function cellClassName(kind: CalendarCell["kind"]): string {
  const base = "mx-auto flex h-8 w-8 items-center justify-center text-[12.5px]";
  switch (kind) {
    case "same":
      return `${base} cursor-pointer rounded-full bg-primary font-bold text-white`;
    case "start":
      return `${base} cursor-pointer rounded-l-full bg-primary font-bold text-white`;
    case "end":
      return `${base} cursor-pointer rounded-r-full bg-primary font-bold text-white`;
    case "in-range":
      return `${base} cursor-pointer bg-primary-soft-bg text-primary-soft-text`;
    case "normal":
      return `${base} cursor-pointer rounded-full text-text-primary hover:bg-hover-bg`;
    default:
      // "filler" — muted lead/trail dates from adjacent months. Not a
      // brand color, kept as a deliberate one-off faint literal (with
      // an explicit dark: pair, since a light-mode-only faint gray
      // would be nearly invisible against a dark background).
      return `${base} cursor-default text-[#BFBDB6] dark:text-[#4A4D54]`;
  }
}

function MonthGrid({
  year,
  month,
  cells,
  weekdays,
  locale,
  onDayClick,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  cells: CalendarCell[];
  weekdays: string[];
  locale: string;
  onDayClick: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="w-full flex-1">
      <div className="mb-2.5 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="cursor-pointer flex h-6 w-6 items-center justify-center rounded text-text-secondary"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="text-[13.5px] font-bold text-text-primary">{monthYearLabel(year, month, locale)}</div>
        <button
          onClick={onNext}
          className="cursor-pointer flex h-6 w-6 items-center justify-center rounded text-text-secondary"
        >
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 text-center text-[12.5px] text-text-secondary">
        {weekdays.map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((c, i) => (
          <div key={i} className={cellClassName(c.kind)} onClick={() => c.date && onDayClick(c.date)}>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DateRangePicker({
  label,
  value,
  onChange,
  placeholder,
  modalTitle,
  quickRanges,
  resetLabel,
  cancelLabel,
  applyLabel,
  noDateSelectedLabel,
  fromLabel,
  toLabel,
  pickEndDateLabel,
  daysSuffix,
  locale = "en-GB",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quickRange, setQuickRange] = useState<string>("");
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const [tempEnd, setTempEnd] = useState<Date | null>(null);
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());

  const displayLabel =
    value.start && value.end
      ? `${formatDisplayDate(value.start, locale)} \u2013 ${formatDisplayDate(value.end, locale)}`
      : value.start
        ? formatDisplayDate(value.start, locale)
        : placeholder;

  const matchQuickKey = (s: Date | null, e: Date | null): string => {
    if (!s || !e) return "";
    const today = startOfDay(new Date());
    const candidates: { key: string; s: Date; e: Date }[] = [
      { key: "today", s: today, e: today },
      { key: "yesterday", s: addDays(today, -1), e: addDays(today, -1) },
      { key: "last7", s: addDays(today, -6), e: today },
      { key: "month", s: new Date(today.getFullYear(), today.getMonth(), 1), e: today },
      {
        key: "lastmonth",
        s: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        e: new Date(today.getFullYear(), today.getMonth(), 0),
      },
      { key: "year", s: new Date(today.getFullYear(), 0, 1), e: today },
      {
        key: "lastyear",
        s: new Date(today.getFullYear() - 1, 0, 1),
        e: new Date(today.getFullYear() - 1, 11, 31),
      },
    ];
    const hit = candidates.find((c) => isSameDay(c.s, s) && isSameDay(c.e, e));
    return hit ? hit.key : "custom";
  };

  const openModal = () => {
    setTempStart(value.start);
    setTempEnd(value.end);
    const base = value.start ?? new Date();
    setCalYear(base.getFullYear());
    setCalMonth(base.getMonth());
    setQuickRange(matchQuickKey(value.start, value.end));
    setIsOpen(true);
  };

  const handleDayClick = (d: Date) => {
    setQuickRange("custom");
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(d);
      setTempEnd(null);
      return;
    }
    if (d.getTime() < tempStart.getTime()) {
      setTempEnd(tempStart);
      setTempStart(d);
    } else {
      setTempEnd(d);
    }
  };

  const computeQuickRangeDates = (key: string, today: Date): { s: Date; e: Date } | null => {
    switch (key) {
      case "today":
        return { s: today, e: today };
      case "yesterday": {
        const y = addDays(today, -1);
        return { s: y, e: y };
      }
      case "last7":
        return { s: addDays(today, -6), e: today };
      case "month":
        return { s: new Date(today.getFullYear(), today.getMonth(), 1), e: today };
      case "lastmonth":
        return {
          s: new Date(today.getFullYear(), today.getMonth() - 1, 1),
          e: new Date(today.getFullYear(), today.getMonth(), 0),
        };
      case "year":
        return { s: new Date(today.getFullYear(), 0, 1), e: today };
      case "lastyear":
        return {
          s: new Date(today.getFullYear() - 1, 0, 1),
          e: new Date(today.getFullYear() - 1, 11, 31),
        };
      default:
        return null;
    }
  };

  const selectQuickRange = (key: string) => {
    setQuickRange(key);
    const computed = computeQuickRangeDates(key, startOfDay(new Date()));
    if (!computed) return;

    const { s, e } = computed;
    setTempStart(s);
    setTempEnd(e);
    setCalYear(s.getFullYear());
    setCalMonth(s.getMonth());
  };

  const resetModal = () => {
    setTempStart(null);
    setTempEnd(null);
    setQuickRange("");
  };

  const applyRange = () => {
    onChange({ start: tempStart, end: tempEnd ?? tempStart });
    setIsOpen(false);
  };

  const nextCalMonth = calMonth === 11 ? 0 : calMonth + 1;
  const nextCalYear = calMonth === 11 ? calYear + 1 : calYear;
  const calCells1 = buildCalendarCells(calYear, calMonth, tempStart, tempEnd);
  const calCells2 = buildCalendarCells(nextCalYear, nextCalMonth, tempStart, tempEnd);
  const weekdays = weekdayHeaders(locale);

  const goPrevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const summaryDaysLabel = tempStart && tempEnd ? daysSuffix(daysBetween(tempStart, tempEnd)) : "";

  return (
    <div className={className}>
      <label className="mb-1.75 block text-[12.5px] font-bold text-text-secondary">{label}</label>
      <button
        onClick={openModal}
        className="cursor-pointer flex w-full items-center gap-2 rounded-[9px] border-[1.5px] border-surface-border bg-surface px-3 py-2.5 text-[13px] font-semibold transition hover:bg-header-row-bg"
      >
        <Calendar size={15} className="text-text-secondary" />
        <span className={`flex-1 text-left ${value.start ? "text-text-primary" : "text-text-secondary"}`}>
          {displayLabel}
        </span>
        <ChevronDown size={13} strokeWidth={2} className="text-text-secondary" />
      </button>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} closeOnBackdropClick={false}>
          <div className="mx-auto max-h-[92vh] w-full max-w-170 overflow-y-auto rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-4 sm:px-6 sm:py-5">
              <div className="text-[16px] font-extrabold text-text-primary sm:text-[17px]">{modalTitle}</div>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-chip-bg text-[16px] text-text-secondary transition hover:bg-chip-bg-hover"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="flex gap-2 overflow-x-auto border-b border-surface-border p-3 sm:block sm:w-40 sm:gap-0 sm:overflow-visible sm:p-[14px_10px]">
                {quickRanges.map((qr) => (
                  <button
                    key={qr.key}
                    onClick={() => selectQuickRange(qr.key)}
                    className={`cursor-pointer mb-0.5 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-left text-[12.5px] transition sm:w-full sm:gap-2.5 sm:text-[13px] ${
                      quickRange === qr.key
                        ? "bg-primary-soft-bg font-bold text-primary-soft-text"
                        : "bg-transparent font-semibold text-text-secondary hover:bg-primary/8"
                    }`}
                  >
                    <Calendar size={14} className="shrink-0" />
                    {qr.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 border-l border-surface-border p-4 sm:p-[18px_22px]">
                <div className="flex flex-col gap-5 sm:flex-row sm:gap-7">
                  <MonthGrid
                    year={calYear}
                    month={calMonth}
                    cells={calCells1}
                    weekdays={weekdays}
                    locale={locale}
                    onDayClick={handleDayClick}
                    onPrev={goPrevMonth}
                    onNext={goNextMonth}
                  />
                  <div className="hidden sm:block sm:flex-1">
                    <MonthGrid
                      year={nextCalYear}
                      month={nextCalMonth}
                      cells={calCells2}
                      weekdays={weekdays}
                      locale={locale}
                      onDayClick={handleDayClick}
                      onPrev={goPrevMonth}
                      onNext={goNextMonth}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-[9px] bg-primary-soft-bg px-3.5 py-2.5 text-[12.5px] text-text-secondary sm:text-[13px]">
                  <Calendar size={14} className="shrink-0" />
                  {tempStart ? (
                    <>
                      {fromLabel} <b>{formatDisplayDate(tempStart, locale)}</b>
                      {tempEnd && (
                        <>
                          &nbsp;{toLabel} <b>{formatDisplayDate(tempEnd, locale)}</b>&nbsp;{summaryDaysLabel}
                        </>
                      )}
                      {!tempEnd && <>&nbsp;— {pickEndDateLabel}</>}
                    </>
                  ) : (
                    noDateSelectedLabel
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse items-stretch gap-2.5 border-t border-surface-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <Button variant="secondary" onClick={resetModal} icon={<RotateCcw size={14} />}>
                {resetLabel}
              </Button>
              <div className="flex gap-2.5">
                <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1 sm:flex-none">
                  {cancelLabel}
                </Button>
                <Button onClick={applyRange} disabled={!tempStart} className="flex-1 sm:flex-none">
                  {applyLabel}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}