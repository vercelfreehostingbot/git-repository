import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface DetailField {
  label: string;
  value: ReactNode;
  // Spans both grid columns — use for fields whose value tends to be
  // long (description, address) so it doesn't sit awkwardly narrow
  // next to a short field like a date or amount.
  fullWidth?: boolean;
  // Explicit control, not CSS :last-child — the last VISUAL row can
  // contain a PAIR of half-width fields side-by-side in the 2-column
  // grid, and :last-child alone would only catch one of the two,
  // leaving an asymmetric border on its pair. The calling page knows
  // its own field order, so it marks whichever field(s) are actually
  // last.
  noBorder?: boolean;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
  closeLabel: string;
  footerActions?: ReactNode;
}

export function DetailModal({ isOpen, onClose, title, fields, closeLabel, footerActions }: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="mx-auto flex max-h-[90vh] w-full max-w-160 flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-4 sm:px-6 sm:py-5">
          <div className="text-[15.5px] font-extrabold text-text-primary sm:text-[17px]">{title}</div>
          <button
            onClick={onClose}
            className="cursor-pointer flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-chip-bg text-text-secondary transition hover:bg-chip-bg-hover"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 overflow-y-auto px-4 pt-3.5 sm:grid-cols-2 sm:px-6">
          {fields.map((field) => (
            <div
              key={field.label}
              className={`pb-3.5 ${field.noBorder ? "" : "border-b border-surface-border"} ${field.fullWidth ? "sm:col-span-2" : ""}`}
            >
              <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-text-secondary">
                {field.label}
              </div>
              <div className="flex items-center gap-0 text-[13.5px] font-semibold text-text-primary sm:text-[14px]">
                {field.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-surface-border px-4 pb-3.5 pt-4 sm:px-6 sm:pb-4 sm:pt-8">
          {footerActions}
          <Button variant="secondary" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}