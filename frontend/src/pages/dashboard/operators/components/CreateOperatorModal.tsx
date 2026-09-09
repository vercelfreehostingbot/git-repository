import { useState } from "react";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";
import { FormLabel } from "../../../../components/ui/FormLabel";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import { useCreateUserMutation } from "../../../../redux/features/users/usersApi";

interface CreateOperatorModalProps {
  t: TFunction;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateOperatorModal({ t, isOpen, onClose, onCreated }: CreateOperatorModalProps) {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isCreating) return;
    setName("");
    setEmail("");
    setPassword("");
    setFormError(null);
    onClose();
  };

  const submitForm = async () => {
    setFormError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError(t("form.errors.required"));
      return;
    }
    if (password.length < 8) {
      setFormError(t("form.errors.passwordLength"));
      return;
    }

    try {
      const created = await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role: "OPERATOR",
      }).unwrap();

      toast.success(t("toast.operatorCreated", { name: created.name }));
      handleClose();
      onCreated();
    } catch (err) {
      setFormError(getErrorMessage(err as never));
    }
  };

  return (
    <Modal onClose={handleClose} closeOnBackdropClick={false}>
      <div className="max-h-[88vh] w-[560px] max-w-[92vw] overflow-y-auto rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-5">
          <div className="text-[17px] font-extrabold text-text-primary">{t("form.createTitle")}</div>
          <button
            onClick={handleClose}
            className="cursor-pointer flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-chip-bg text-text-secondary transition hover:bg-chip-bg-hover"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-[22px]">
          {formError && (
            <div className="rounded-[9px] bg-danger-soft-bg px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-soft-text">
              {formError}
            </div>
          )}

          <div className="flex gap-3.5">
            <div className="flex-1">
              <FormLabel required>{t("form.fullName")}</FormLabel>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("form.fullNamePlaceholder")}
                disabled={isCreating}
                className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="flex-1">
              <FormLabel required>{t("form.email")}</FormLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("form.emailPlaceholder")}
                disabled={isCreating}
                className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <FormLabel required>{t("form.tempPassword")}</FormLabel>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("form.tempPasswordPlaceholder")}
              disabled={isCreating}
              className="w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-surface-border px-6 py-4">
          <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
            {t("form.cancel")}
          </Button>
          <Button onClick={submitForm} isLoading={isCreating}>
            {isCreating ? t("form.creating") : t("form.create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}