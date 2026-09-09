import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  isConfirming?: boolean;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isConfirming = false,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const iconBadgeClass = isDanger
    ? "bg-danger-soft-bg text-danger-soft-text"
    : "bg-primary-soft-bg text-primary-soft-text";

  return (
    <Modal onClose={() => !isConfirming && onClose()}>
      <div className="mx-auto w-full max-w-105 rounded-2xl bg-surface p-6.5 shadow-2xl">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBadgeClass}`}>
          <AlertTriangle size={24} strokeWidth={2} />
        </div>
        <div className="mb-2 text-[16.5px] font-extrabold text-text-primary">{title}</div>
        <div className="mb-5.5 text-[13.5px] leading-relaxed text-text-secondary">{message}</div>
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? "dangerSolid" : "primary"}
            onClick={onConfirm}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}