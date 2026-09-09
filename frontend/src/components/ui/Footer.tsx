import { useTranslation } from "react-i18next";
import { getIntlLocale } from "../../utils/locale";

export function Footer() {
  const { t, i18n } = useTranslation("common");
  const intlLocale = getIntlLocale(i18n.language);
  const currentYear = new Date().getFullYear().toLocaleString(intlLocale, {
    useGrouping: false,
  });

  return (
    <div className="px-4 py-3 text-center text-[10px] text-text-secondary sm:px-6 sm:py-4 sm:text-[11px]">
      {t("copyright", { year: currentYear })}
    </div>
  );
}