import { useState } from "react";
import { toast } from "sonner";
import type { TFunction } from "i18next";
import { FormLabel } from "../../../../components/ui/FormLabel";
import { Button } from "../../../../components/ui/Button";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import { useUpdateMyProfileMutation } from "../../../../redux/features/users/usersApi";
import type { User } from "../../../../redux/features/api/authApi/types";

interface PersonalInfoCardProps {
  t: TFunction;
  user: User | null;
}

const inputClass =
  "w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:bg-header-row-bg disabled:text-text-secondary";

export function PersonalInfoCard({ t, user }: PersonalInfoCardProps) {
  // Full Name editable; Email/Designation read-only — email is
  // permanently non-self-editable, Designation is derived from role,
  // not free text.
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [updateProfile, { isLoading: isSavingInfo }] = useUpdateMyProfileMutation();
  const [infoError, setInfoError] = useState<string | null>(null);

  const roleLabel = user?.role === "ADMIN" ? t("roleAdmin") : t("roleOperator");

  const saveInfo = async () => {
    if (!nameDraft.trim()) return;
    setInfoError(null);
    try {
      await updateProfile({ name: nameDraft.trim() }).unwrap();
      toast.success(t("profileUpdated"));
    } catch (err) {
      setInfoError(getErrorMessage(err as never));
    }
  };

  return (
    <div className="rounded-[14px] border border-surface-border bg-surface p-6">
      <h2 className="mb-4 text-[15px] font-extrabold text-text-primary">{t("infoTitle")}</h2>

      {infoError && (
        <div className="mb-4 rounded-[9px] bg-danger-soft-bg px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-soft-text">
          {infoError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FormLabel>{t("fields.name")}</FormLabel>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            disabled={isSavingInfo}
            className={inputClass}
          />
        </div>
        <div>
          <FormLabel>{t("fields.email")}</FormLabel>
          <input value={user?.email ?? ""} disabled className={inputClass} />
        </div>
        <div>
          <FormLabel>{t("fields.designation")}</FormLabel>
          <input value={roleLabel} disabled className={inputClass} />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={saveInfo} isLoading={isSavingInfo} disabled={!nameDraft.trim()}>
          {isSavingInfo ? t("common:saving") : t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}