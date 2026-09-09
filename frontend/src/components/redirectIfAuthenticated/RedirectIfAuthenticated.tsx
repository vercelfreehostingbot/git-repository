import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../../redux/app/hooks';

/**
 * Guards routes that should only be reachable when NOT logged in
 * (e.g. /login). If a valid session already exists, the user is
 * redirected to the dashboard instead of seeing the login form again.
 */
export function RedirectIfAuthenticated() {
    const { accessToken, user } = useAppSelector((state) => state.auth);

    if (accessToken && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}