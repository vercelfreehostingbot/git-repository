import { Outlet } from "react-router";
import { useState } from "react";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { Footer } from "../components/ui/Footer";

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Mobile Header */}
            <Header onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                    onClick={() => setIsSidebarOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            setIsSidebarOpen(false);
                        }
                    }}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    w-64
                    border-r border-sidebar-border
                    bg-sidebar-bg
                    transition-transform duration-300 ease-in-out
                    ${
                        isSidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                    lg:translate-x-0
                `}
            >
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            {/* Main Content */}
            <main className="flex min-h-screen flex-col bg-background p-4 pb-0 lg:px-8 lg:ml-64">
                <div className="flex-1">
                    <Outlet />
                </div>
                <Footer />
            </main>
        </div>
    );
};

export default DashboardLayout;