import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Bengali namespaces
import bnCommon from '../locales/bn/common.json';
import bnErrors from '../locales/bn/errors.json';
import bnLogin from '../locales/bn/login.json';
import bnDashboard from '../locales/bn/dashboard.json';
import bnSidebar from '../locales/bn/sidebar.json';
import bnOperators from '../locales/bn/operators.json';
import bnIncomeVouchers from '../locales/bn/incomeVouchers.json';
import bnExpenseVouchers from '../locales/bn/expenseVouchers.json';
import bnProfile from '../locales/bn/profile.json';
import bnSettings from '../locales/bn/settings.json';

// English namespaces
import enCommon from '../locales/en/common.json';
import enErrors from '../locales/en/errors.json';
import enLogin from '../locales/en/login.json';
import enDashboard from '../locales/en/dashboard.json';
import enSidebar from '../locales/en/sidebar.json';
import enOperators from '../locales/en/operators.json';
import enIncomeVouchers from '../locales/en/incomeVouchers.json';
import enExpenseVouchers from '../locales/en/expenseVouchers.json';
import enProfile from '../locales/en/profile.json';
import enSettings from '../locales/en/settings.json';

const STORAGE_KEY = 'ecms_lang';
const storedLang = localStorage.getItem(STORAGE_KEY);
const initialLang = storedLang === 'en' || storedLang === 'bn' ? storedLang : 'bn';

i18n.use(initReactI18next).init({
    resources: {
        bn: {
            common: bnCommon,
            errors: bnErrors,
            login: bnLogin,
            dashboard: bnDashboard,
            sidebar: bnSidebar,
            operators: bnOperators,
            incomeVouchers: bnIncomeVouchers,
            expenseVouchers: bnExpenseVouchers,
            profile: bnProfile,
            settings: bnSettings,
        },
        en: {
            common: enCommon,
            errors: enErrors,
            login: enLogin,
            dashboard: enDashboard,
            sidebar: enSidebar,
            operators: enOperators,
            incomeVouchers: enIncomeVouchers,
            expenseVouchers: enExpenseVouchers,
            profile: enProfile,
            settings: enSettings,
        },
    },
    lng: initialLang,
    fallbackLng: 'bn',
    defaultNS: 'common',
    ns: [
        'common',
        'errors',
        'login',
        'dashboard',
        'sidebar',
        'operators',
        'incomeVouchers',
        'expenseVouchers',
        'profile',
        'settings',
    ],
    interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
});
document.documentElement.lang = initialLang;

export default i18n;