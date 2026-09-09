import { createBrowserRouter, Navigate } from "react-router";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/login/LoginPage";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProtectedRoute } from "../components/protectedRoute/ProtectedRoute";
import { RedirectIfAuthenticated } from "../components/redirectIfAuthenticated/RedirectIfAuthenticated";
import OperatorsPage from "../pages/dashboard/operators/OperatorsPage";
import DashboardNotFoundPage from "../pages/notFound/DashboardNotFoundPage";
import NotFoundPage from "../pages/notFound/NotFoundPage";
import IncomeVouchersPage from "../pages/dashboard/incomeVouchers/IncomeVouchersPage";
import ExpenseVouchersPage from "../pages/dashboard/expenseVouchers/ExpenseVouchersPage";
import ProfilePage from "../pages/dashboard/profile/ProfilePage";
import DoLettersPage from "../pages/dashboard/doLetters/DoLettersPage";
import IncomeReportPage from "../pages/dashboard/incomeReport/IncomeReportPage";
import ExpenseReportPage from "../pages/dashboard/expenseReport/ExpenseReportPage";
import GeneralSettingsPage from "../pages/dashboard/generalSettings/GeneralSettingsPage";

export const router = createBrowserRouter([
    {
        // Redirect root URL (/) immediately to the dashboard path
        path: "/",
        element: <Navigate to="/dashboard" replace />,
    },
    {
        // If a valid session already exists, bounce away from /login
        // instead of showing the form again.
        Component: RedirectIfAuthenticated,
        children: [
            {
                path: "/login",
                Component: LoginPage,
            },
        ],
    },
    {
        // Guards everything below it — no dashboard route is reachable
        // without a valid accessToken/user in Redux state.
        Component: ProtectedRoute,
        children: [
            {
                path: "/dashboard",
                Component: DashboardLayout,
                children: [
                    {
                        index: true,
                        Component: DashboardPage
                    },
                    {
                        path: "accounts/income-vouchers",
                        Component: IncomeVouchersPage
                    },
                    {
                        path: "accounts/expense-vouchers",
                        Component: ExpenseVouchersPage
                    },
                    {
                        path: "do-letters",
                        Component: DoLettersPage
                    },
                    {
                        path: "income-report",
                        Component: IncomeReportPage
                    },
                    {
                        path: "expense-report",
                        Component: ExpenseReportPage
                    },
                    {
                        path: "operators",
                        Component: OperatorsPage
                    },
                    {
                        path: "general-settings",
                        Component: GeneralSettingsPage
                    },
                    {
                        path: "profile",
                        Component: ProfilePage
                    },
                    {
                        path: "*",
                        Component: DashboardNotFoundPage
                    },
                ]
            },
        ],
    },
    {
        path: "*",
        Component: NotFoundPage
    },
]);