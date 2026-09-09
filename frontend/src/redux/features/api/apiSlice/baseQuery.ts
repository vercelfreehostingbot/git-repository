import {
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import type { RootState } from '../../../app/store';
import { accessTokenUpdated, userLoggedOut } from '../../auth/authSlice';
import type { ApiResponse, RefreshResponse } from '../authApi/types';

// Prevents multiple simultaneous 401s (e.g. several requests firing at
// once right after the access token expires) from each independently
// calling /auth/refresh. Only one refresh call runs; the rest wait for it.
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
    // Set per environment: an absolute URL in local development, and a
    // relative "/api/v1" wherever a proxy puts the API on the same origin
    // (Vercel rewrites, or Nginx on a self-hosted server).
    baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
    // Required so the httpOnly refresh_token cookie is sent to the API.
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const accessToken = (getState() as RootState).auth.accessToken;
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();

            try {
                let refreshResult = await rawBaseQuery(
                    { url: '/auth/refresh', method: 'POST' },
                    api,
                    extraOptions,
                );

                // 409 means another request rotated the session first. The
                // server keeps the previous token valid for a short grace
                // period, so an immediate retry succeeds with the same cookie.
                if (refreshResult.error?.status === 409) {
                    refreshResult = await rawBaseQuery(
                        { url: '/auth/refresh', method: 'POST' },
                        api,
                        extraOptions,
                    );
                }

                if (refreshResult.data) {
                    // rawBaseQuery bypasses each endpoint's transformResponse,
                    // so the envelope is still wrapped here — unwrap manually.
                    const { accessToken } = (
                        refreshResult.data as ApiResponse<RefreshResponse>
                    ).data;

                    api.dispatch(accessTokenUpdated(accessToken));
                    // Retry the original request now that we have a fresh token.
                    result = await rawBaseQuery(args, api, extraOptions);
                } else if (refreshResult.error?.status === 401) {
                    // Only a real auth failure means the session is gone.
                    // Rate limits, network errors, and server errors leave
                    // the session intact, so don't sign the user out for them.
                    api.dispatch(userLoggedOut());
                }
            } finally {
                release();
            }
        } else {
            // Another request already triggered a refresh; wait for it to
            // finish, then retry this request with whatever token resulted.
            await mutex.waitForUnlock();
            result = await rawBaseQuery(args, api, extraOptions);
        }
    }

    return result;
};