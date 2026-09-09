import { useState } from "react";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";
import { FormLabel } from "../../../../components/ui/FormLabel";
import { TakaIcon } from "../../../../components/ui/TakaIcon";
import { COLORS } from "../../../../styles/colors";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import {
  useCreateIncomeVoucherMutation,
  useUpdateIncomeVoucherMutation,
} from "../../../../redux/features/incomeVouchers/incomeVouchersApi";
import type { IncomeVoucher } from "../../../../redux/features/incomeVouchers/types";

function normalizeDigits(value: string): string {
  const bengaliDigits = '০১২৩৪৫৬৭৮৯';
  return value.replace(/[০-৯]/g, (d) => String(bengaliDigits.indexOf(d)));
}

interface CreateEditIncomeVoucherModalProps {
  t: TFunction;
  isOpen: boolean;
  mode: "create" | "edit";
  voucher?: IncomeVoucher | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CreateEditIncomeVoucherModal({
  t,
  isOpen,
  mode,
  voucher,
  onClose,
  onSaved,
}: CreateEditIncomeVoucherModalProps) {
  const [createVoucher, { isLoading: isCreating }] = useCreateIncomeVoucherMutation();
  const [updateVoucher, { isLoading: isUpdating }] = useUpdateIncomeVoucherMutation();
  const isSaving = isCreating || isUpdating;

  const [date, setDate] = useState(voucher ? voucher.date.slice(0, 10) : "");
  const [amount, setAmount] = useState(voucher ? String(voucher.amount) : "");
  const [incomeSource, setIncomeSource] = useState(voucher?.incomeSource ?? "");
  const [description, setDescription] = useState(voucher?.description ?? "");
  const [reference, setReference] = useState(voucher?.reference ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  if (!isOpen) return null;

  const resetFields = () => {
    setDate(voucher ? voucher.date.slice(0, 10) : "");
    setAmount(voucher ? String(voucher.amount) : "");
    setIncomeSource(voucher?.incomeSource ?? "");
    setDescription(voucher?.description ?? "");
    setReference(voucher?.reference ?? "");
    setFormError(null);
  };

  const handleClose = () => {
    if (isSaving) return;
    resetFields();
    onClose();
  };

  const submitForm = async () => {
    setFormError(null);

    if (!date || !amount.trim() || !incomeSource.trim() || !description.trim() || !reference.trim()) {
      setFormError(t("form.errors.required"));
      return;
    }

    if (date > todayStr) {
      setFormError(t("form.errors.futureDate"));
      return;
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(t("form.errors.invalidAmount"));
      return;
    }

    const payload = {
      date,
      amount: parsedAmount,
      incomeSource: incomeSource.trim(),
      description: description.trim(),
      reference: reference.trim(),
    };

    try {
      if (mode === "edit" && voucher) {
        const updated = await updateVoucher({ id: voucher.id, data: payload }).unwrap();
        toast.success(t("toast.voucherUpdated", { voucherNumber: updated.voucherNumber }));
      } else {
        const created = await createVoucher(payload).unwrap();
        toast.success(t("toast.voucherCreated", { voucherNumber: created.voucherNumber }));
      }
      resetFields();
      onClose();
      onSaved();
    } catch (err) {
      setFormError(getErrorMessage(err as never));
    }
  };

  return (
    <Modal onClose={handleClose} closeOnBackdropClick={false}>
      <div className="max-h-[88vh] w-[560px] max-w-[92vw] overflow-y-auto rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-5">
          <div className="text-[17px] font-extrabold text-text-primary">
            {mode === "edit" ? t("form.editTitle") : t("form.createTitle")}
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-chip-bg text-text-secondary transition hover:bg-chip-bg-hover"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-[22px]">
          {formError && (
            <div className="rounded-[9px] bg-danger-soft-bg px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-soft-text">
              {formError}
            </div>
          )}

          <div>
            <FormLabel required>{t("form.date")}</FormLabel>
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSaving}
              className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex gap-3.5">
            <div className="flex-1">
              <FormLabel required>
                <span className="inline-flex items-center gap-1">
                  {t("form.amount")} <TakaIcon size={12} color={COLORS.textSecondary} />
                </span>
              </FormLabel>
              <input
                value={amount}
                onChange={(e) => setAmount(normalizeDigits(e.target.value))}
                placeholder={t("form.amountPlaceholder")}
                disabled={isSaving}
                className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="flex-1">
              <FormLabel required>{t("form.incomeSource")}</FormLabel>
              <input
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                placeholder={t("form.incomeSourcePlaceholder")}
                disabled={isSaving}
                className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <FormLabel required>{t("form.description")}</FormLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")}
              rows={3}
              disabled={isSaving}
              className="w-full resize-y cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <FormLabel required>{t("form.reference")}</FormLabel>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t("form.referencePlaceholder")}
              disabled={isSaving}
              className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-surface-border px-6 py-4">
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            {t("form.cancel")}
          </Button>
          <Button onClick={submitForm} isLoading={isSaving}>
            {mode === "edit"
              ? isSaving
                ? t("form.saving")
                : t("form.saveChanges")
              : isSaving
                ? t("form.creating")
                : t("form.create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}