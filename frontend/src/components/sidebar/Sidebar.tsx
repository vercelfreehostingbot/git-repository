import { useState } from "react";
import { LogOut, CircleUserRound, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useLocation } from "react-router";
import logo from "../../assets/logo/jatiyo-sangsad.webp";
import { sidebarMenuSections } from "./sidebarMenuSections";
import type { SidebarProps } from "./types";
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks";
import { useLogoutMutation } from "../../redux/features/api/authApi/authApi";
import { userLoggedOut } from "../../redux/features/auth/authSlice";

const NAV_LINK_BASE =
    "group flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200";
const NAV_LINK_ACTIVE = "bg-sidebar-accent text-white ring-1 ring-sidebar-accent/40";
const NAV_LINK_INACTIVE = "text-sidebar-text-secondary hover:bg-sidebar-hover hover:text-sidebar-text";

const Sidebar = ({ onClose }: SidebarProps) => {
    const { t } = useTranslation(["sidebar", "common"]);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
    const user = useAppSelector((state) => state.auth.user);

    // Auto-expand any group whose child matches the current route, so
    // landing directly on e.g. /dashboard/accounts/income-vouchers
    // (via refresh or a bookmark) shows the group already open instead
    // of hiding the active link inside a collapsed submenu.
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        for (const section of sidebarMenuSections) {
            for (const item of section.items) {
                if ("children" in item && item.children?.some((c) => location.pathname.startsWith(c.path))) {
                    return item.label;
                }
            }
        }
        return null;
    });

    async function handleLogout() {
        try {
            await logout().unwrap();
        } catch {
            // Intentionally empty: even if the logout API call fails (e.g.
            // network issue), we still want to clear local auth state and
            // redirect below. Catching (and silently discarding) the error
            // here prevents an unhandled promise rejection from showing up
            // in the browser console or in error-tracking tools.
        } finally {
            dispatch(userLoggedOut());
            navigate("/login", { replace: true });
        }
    }

    function closeOnMobile() {
        if (window.innerWidth < 1024) {
            onClose?.();
        }
    }

    return (
        <div className="flex h-full flex-col bg-sidebar-bg text-sidebar-text">
            {/* Logo */}
            <div className="border-b border-sidebar-border px-5 py-5">
                <button
                    type="button"
                    onClick={() => {
                        navigate("/dashboard");
                        closeOnMobile();
                    }}
                    className="flex cursor-pointer items-center gap-3 text-left"
                >
                    <div className="flex h-11 w-11 items-center justify-center">
                        <img
                            src={logo}
                            alt="Jatiya Sangsad Logo"
                            className="h-11 w-11 object-contain"
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold tracking-wide">
                            {t("common:appNameShort")}
                        </h2>

                        <p className="text-[10px] uppercase tracking-[2px] text-sidebar-text-secondary">
                            {t("managementSystem")}
                        </p>
                    </div>
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-6 no-scrollbar">
                {sidebarMenuSections.map((section) => (
                    <div
                        key={section.title}
                        className="mb-8"
                    >
                        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[2px] text-sidebar-text-secondary">
                            {t(section.title)}
                        </p>

                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;

                                // ---- Group with submenu (e.g. "Accounts") ----
                                if ("children" in item && item.children) {
                                    const isOpen = openGroup === item.label;
                                    const isChildActive = item.children.some((c) =>
                                        location.pathname.startsWith(c.path),
                                    );

                                    return (
                                        <div key={item.label}>
                                            <button
                                                type="button"
                                                onClick={() => setOpenGroup(isOpen ? null : item.label)}
                                                aria-expanded={isOpen}
                                                className={`${NAV_LINK_BASE} w-full cursor-pointer justify-between ${
                                                    isChildActive ? "text-sidebar-text" : NAV_LINK_INACTIVE
                                                }`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <Icon size={18} strokeWidth={2} />
                                                    <span>{t(item.label)}</span>
                                                </span>
                                                <ChevronDown
                                                    size={15}
                                                    strokeWidth={2}
                                                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                                />
                                            </button>

                                            <div
                                                className={`grid transition-all duration-300 ease-in-out ${
                                                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="mt-1 ml-[15px] flex flex-col gap-1 border-l border-sidebar-border pl-4">
                                                        {item.children.map((child) => (
                                                            <NavLink
                                                                key={child.path}
                                                                to={child.path}
                                                                onClick={closeOnMobile}
                                                                className={({ isActive }) =>
                                                                    `${NAV_LINK_BASE} py-1.5 text-[13.5px] ${
                                                                        isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE
                                                                    }`
                                                                }
                                                            >
                                                                <span>{t(child.label)}</span>
                                                            </NavLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // ---- Plain nav-link ----
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path!}
                                        end={item.path === "/dashboard"}
                                        onClick={closeOnMobile}
                                        className={({ isActive }) =>
                                            `${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}`
                                        }
                                    >
                                        <Icon size={18} strokeWidth={2} />
                                        <span>{t(item.label)}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* User */}
            <div className="border-t border-sidebar-border p-4">
                <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-sidebar-hover">
                    <button
                        type="button"
                        onClick={() => {
                            navigate("/dashboard/profile");
                            closeOnMobile();
                        }}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-white">
                            <CircleUserRound size={22} strokeWidth={1.75} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold text-sidebar-text">
                                {user?.name ?? "..."}
                            </h4>

                            <p className="truncate text-xs text-sidebar-text-secondary">
                                {user?.role === "ADMIN" ? t("admin") : t("operator")}
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        title={t("common:logout")}
                        aria-label={t("common:logout")}
                        disabled={isLoggingOut}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sidebar-text-secondary transition-all duration-200 hover:bg-[rgba(217,107,82,0.15)] hover:text-[#D96B52] focus:outline-none focus:ring-2 focus:ring-danger/30 disabled:opacity-50"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;