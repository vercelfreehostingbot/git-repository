import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRefreshMutation } from '../api/authApi/authApi';
import { userLoggedIn, userLoggedOut } from './authSlice';
import { useAppDispatch } from '../../app/hooks';

/**
 * The access token and user object both live only in memory, so a full
 * page reload loses them. On mount, this fires a silent /auth/refresh
 * call, relying on the httpOnly refresh cookie the browser still holds,
 * to restore the full session (token + user) in a single request before
 * rendering any protected route.
 */
export function AuthInitializer({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const [refresh] = useRefreshMutation();
    const [isChecking, setIsChecking] = useState(true);

    // StrictMode runs effects twice in development. Because the server
    // rotates the refresh token on every call, two simultaneous requests
    // make the second one lose the race and fail — which would log the
    // user out on every reload. This guard keeps it to a single call.
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        refresh()
            .unwrap()
            .then(({ accessToken, user }) => {
                dispatch(userLoggedIn({ accessToken, user }));
            })
            .catch(() => {
                // No valid refresh cookie — user simply isn't logged in.
                dispatch(userLoggedOut());
            })
            .finally(() => {
                setIsChecking(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-text-secondary">
                Loading…
            </div>
        );
    }

    return <>{children}</>;
}