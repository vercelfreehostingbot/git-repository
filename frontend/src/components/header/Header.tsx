import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HeaderProps } from "./types";

const Header = ({ onMenuClick }: HeaderProps) => {
    const { t } = useTranslation("common");

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar-bg px-4 text-sidebar-text lg:hidden">
            <button
                type="button"
                onClick={onMenuClick}
                aria-label={t("openSidebar")}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-sidebar-hover focus:outline-none focus:ring-2 focus:ring-sidebar-accent/40"
            >
                <Menu size={22} />
            </button>

            <h1 className="text-base font-semibold tracking-wide">
                {t("appNameShort")}
            </h1>

            {/* Balance spacing */}
            <div className="h-10 w-10" />
        </header>
    );
};

export default Header;