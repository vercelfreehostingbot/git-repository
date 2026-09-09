import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { TFunction } from "i18next";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { FormLabel } from "../../../../components/ui/FormLabel";
import { Button } from "../../../../components/ui/Button";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import { useAppDispatch } from "../../../../redux/app/hooks";
import { userLoggedOut } from "../../../../redux/features/auth/authSlice";
import { useChangePasswordMutation } from "../../../../redux/features/users/usersApi";

interface ChangePasswordCardProps {
  t: TFunction;
}

const inputClass =
  "w-full cursor-text rounded-[9px] border-[1.5px] border-surface-border px-3 py-2.5 text-[13.5px] text-text-primary outline-none transition disabled:cursor-not-allowed disabled:bg-header-row-bg disabled:text-text-secondary";

export function ChangePasswordCard({ t }: ChangePasswordCardProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changePassword, { isLoading: isSavingPassword }] = useChangePasswordMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const savePassword = async () => {
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t("errors.required"));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t("errors.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("errors.passwordMismatch"));
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      // The backend invalidates every session (including this one) as
      // a defense-in-depth measure after a password change, so the
      // current refresh token is no longer valid. Clear the local auth
      // state FIRST — otherwise RedirectIfAuthenticated still sees a
      // logged-in user in Redux and bounces us straight back to
      // /dashboard, where the next API call would fail anyway.
      toast.success(t("passwordChangedRelogin"));
      dispatch(userLoggedOut());
      navigate("/login", { replace: true });
    } catch (err) {
      setPasswordError(getErrorMessage(err as never));
    }
  };

  return (
    <div className="rounded-[14px] border border-surface-border bg-surface p-6">
      <h2 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-text-primary">
        <KeyRound size={16} />
        {t("passwordTitle")}
      </h2>

      <div className="flex flex-col gap-4">
        {passwordError && (
          <div className="rounded-[9px] bg-danger-soft-bg px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-soft-text">
            {passwordError}
          </div>
        )}

        <div>
          <FormLabel required>{t("fields.currentPassword")}</FormLabel>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError(null);
              }}
              disabled={isSavingPassword}
              placeholder={t("fields.currentPasswordPlaceholder")}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent text-text-secondary"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel required>{t("fields.newPassword")}</FormLabel>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError(null);
                }}
                disabled={isSavingPassword}
                placeholder={t("fields.newPasswordPlaceholder")}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent text-text-secondary"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <FormLabel required>{t("fields.confirmPassword")}</FormLabel>
            <input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              disabled={isSavingPassword}
              placeholder={t("fields.confirmPasswordPlaceholder")}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={savePassword} isLoading={isSavingPassword}>
            {isSavingPassword ? t("common:saving") : t("passwordSave")}
          </Button>
        </div>
      </div>
    </div>
  );
}