const LOCALE_MAP: Record<string, string> = {
  bn: "bn-BD", // Bangladesh region to avoid Indian bangla
  en: "en-GB", // Great Britain, for day-first date format
};

export function getIntlLocale(language: string): string {
  return LOCALE_MAP[language] ?? "bn-BD";
}