import { useTranslation } from "react-i18next";
import { getIntlLocale } from "../../../utils/locale";
import { useAppSelector } from "../../../redux/app/hooks";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { IdentityCard } from "./components/IdentityCard";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { ChangePasswordCard } from "./components/ChangePasswordCard";

// Fields still needing further backend work:
//   - Avatar upload -> non-functional placeholder for now (see
//     IdentityCard).
export default function ProfilePage() {
  const { t, i18n } = useTranslation(["profile", "common"]);
  useDocumentTitle(t("title"));
  const intlLocale = getIntlLocale(i18n.language);
  const user = useAppSelector((state) => state.auth.user);

  // User.createdAt/lastLoginAt are genuine timestamps (unlike voucher
  // `date` fields, which are @db.Date calendar-only and need forced
  // UTC display) — so these deliberately do NOT set timeZone, letting
  // them render in the browser's local time instead of shared
  // formatDate()'s forced-UTC behavior, which could show the wrong
  // calendar day near the UTC/Dhaka midnight boundary.
  const joinedLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(intlLocale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";
  const lastLoginLabel = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString(intlLocale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : t("firstLogin");

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[24px] font-extrabold text-text-primary">{t("title")}</h1>
        <p className="mt-1 text-[13px] text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <IdentityCard t={t} user={user} joinedLabel={joinedLabel} lastLoginLabel={lastLoginLabel} />

        <div className="flex flex-col gap-5">
          <PersonalInfoCard t={t} user={user} />
          <ChangePasswordCard t={t} />
        </div>
      </div>
    </div>
  );
}