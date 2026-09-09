import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "../../redux/app/hooks";
import type { Role } from "../../redux/features/api/authApi/types";

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { accessToken, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // By the time this renders, AuthInitializer has already resolved the
    // silent-refresh check on app boot, so there's no separate "loading"
    // state to handle here — accessToken/user are either set or they aren't.
    if (!accessToken || !user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
