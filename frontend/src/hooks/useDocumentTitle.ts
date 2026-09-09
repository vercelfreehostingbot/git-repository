import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useDocumentTitle(pageTitle: string) {
  const { t } = useTranslation("common");
  const appName = t("appNameShort");

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} - ${appName}` : appName;

    return () => {
      document.title = appName;
    };
  }, [pageTitle, appName]);
}