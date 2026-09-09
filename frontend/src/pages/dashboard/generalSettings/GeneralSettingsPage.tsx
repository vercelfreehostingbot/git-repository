import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { ChangePasswordCard } from "../profile/components/ChangePasswordCard";
import { isDarkMode, toggleTheme } from "../../../lib/theme";

export default function GeneralSettingsPage() {
  const { t, i18n } = useTranslation(["settings", "common"]);
  // ChangePasswordCard's internal t() calls reference profile.json's
  // keys (passwordTitle, fields.currentPassword, etc.) — reusing the
  // component means reusing its existing translations too, via its
  // own namespace, rather than duplicating those strings into
  // settings.json.
  const { t: tProfile } = useTranslation("profile");
  useDocumentTitle(t("title"));

  const isBengali = i18n.language === "bn";

  // theme.ts already applied the correct class at module-load (before
  // this component ever mounts) — this local state just mirrors that
  // for the toggle's own visual on/off rendering, same reasoning as
  // i18n's isBengali above (React needs its own copy to re-render on).
  const [isDark, setIsDark] = useState(isDarkMode);

  function handleToggleTheme() {
    setIsDark(toggleTheme());
  }

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex max-w-150 flex-col gap-5">
        {/* Appearance */}
        <div className="rounded-[14px] border border-surface-border bg-surface p-6">
          <h2 className="mb-4 text-[15px] font-extrabold text-text-primary">{t("appearance.title")}</h2>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13.5px] font-bold text-text-primary">{t("appearance.darkMode")}</div>
              <div className="mt-0.5 text-[12.5px] text-text-secondary">
                {t("appearance.darkModeDescription")}
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={t("appearance.darkMode")}
              className={`relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 hover:brightness-90 ${
                isDark ? "bg-primary" : "bg-toggle-off"
              }`}
            >
              <span
                className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isDark ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-[14px] border border-surface-border bg-surface p-6">
          <h2 className="mb-4 text-[15px] font-extrabold text-text-primary">{t("language.title")}</h2>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => i18n.changeLanguage("en")}
              className={`cursor-pointer rounded-[9px] px-5 py-2.5 text-[13.5px] font-bold transition ${
                !isBengali
                  ? "bg-primary text-white"
                  : "border-[1.5px] border-surface-border bg-surface text-text-secondary hover:bg-hover-bg"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage("bn")}
              className={`cursor-pointer rounded-[9px] px-5 py-2.5 text-[13.5px] font-bold transition ${
                isBengali
                  ? "bg-primary text-white"
                  : "border-[1.5px] border-surface-border bg-surface text-text-secondary hover:bg-hover-bg"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Change Password — reuses the same component/logic as the
            Profile page, see module comment above. */}
        <ChangePasswordCard t={tProfile} />
      </div>
    </div>
  );
}