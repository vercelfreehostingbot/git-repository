import {
    BarChart3,
    FileText,
    LayoutDashboard,
    Settings,
    Users,
    Wallet,
} from "lucide-react";

export const sidebarMenuSections = [
    {
        title: "main",
        items: [
            { label: "dashboard", path: "/dashboard", icon: LayoutDashboard },
            {
                label: "accounts",
                icon: Wallet,
                children: [
                    { label: "incomeVouchers", path: "/dashboard/accounts/income-vouchers" },
                    { label: "expenseVouchers", path: "/dashboard/accounts/expense-vouchers" },
                ],
            },
            { label: "doLetters", path: "/dashboard/do-letters", icon: FileText },
        ],
    },
    {
        title: "reports",
        items: [
            { label: "incomeReport", path: "/dashboard/income-report", icon: BarChart3 },
            { label: "expenseReport", path: "/dashboard/expense-report", icon: BarChart3 },
            // { label: "summaryReport", path: "/dashboard/summary-report", icon: BarChart3 },
        ],
    },
    {
        title: "administration",
        items: [
            { label: "operators", path: "/dashboard/operators", icon: Users },
        ],
    },
    {
        title: "settings",
        items: [
            { label: "generalSettings", path: "/dashboard/general-settings", icon: Settings },
        ],
    },
];