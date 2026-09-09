const STORAGE_KEY = 'ecms_theme';

const stored = localStorage.getItem(STORAGE_KEY);
const initialIsDark = stored === 'dark';

// Applied here, at module-load time — this file is imported early in
// main.tsx (same spot as ./lib/i18n), so this line runs BEFORE React
// renders anything. That's what avoids a flash-of-wrong-theme: there's
// no light-mode paint-then-flip, because the class is already correct
// by the time the first paint happens.
document.documentElement.classList.toggle('dark', initialIsDark);

export function isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
}

export function toggleTheme(): boolean {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    return isDark;
}