import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const isBengali = i18n.language === 'bn';

    function toggleLang() {
        i18n.changeLanguage(isBengali ? 'en' : 'bn');
    }

    return (
        <button
            type="button"
            onClick={toggleLang}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[oklch(0.85_0.01_95)] bg-surface px-6 py-2.5 text-[13px] font-semibold text-[oklch(0.32_0.02_95)] transition-colors hover:bg-[oklch(0.98_0.004_95)]"
        >
            <span>{isBengali ? '🇧🇩' : 'GB'}</span>
            <span>{t('languageToggle')}</span>
        </button>
    );
}