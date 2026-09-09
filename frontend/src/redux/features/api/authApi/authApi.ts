import { userLoggedIn, userLoggedOut } from '../../auth/authSlice';
import { apiSlice } from '../apiSlice/apiSlice';
import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    Session,
} from './types';

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (data) => ({
                url: '/auth/login',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: ApiResponse<LoginResponse>) =>
                response.data,
            async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    // Access token kept in Redux memory only — never
                    // localStorage — to limit XSS token-theft exposure.
                    // The refresh token lives in an httpOnly cookie the
                    // browser manages on its own; we never touch it here.
                    dispatch(
                        userLoggedIn({
                            accessToken: data.accessToken,
                            user: data.user,
                        }),
                    );
                } catch {
                    // Login failed — surfaced via the mutation's own
                    // `error` field in the component, nothing to do here.
                }
            },
        }),

        // Returns both a new accessToken and the current user object, so
        // AuthInitializer can restore a full session in a single call on
        // page reload — no separate /auth/me request needed.
        refresh: builder.mutation<RefreshResponse, void>({
            query: () => ({ url: '/auth/refresh', method: 'POST' }),
            transformResponse: (response: ApiResponse<RefreshResponse>) =>
                response.data,
        }),

        logout: builder.mutation<void, void>({
            query: () => ({ url: '/auth/logout', method: 'POST' }),
            async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                } finally {
                    // Clear local state regardless of whether the network
                    // call succeeded, so the UI never gets stuck logged in.
                    dispatch(userLoggedOut());
                }
            },
        }),

        logoutAll: builder.mutation<void, void>({
            query: () => ({ url: '/auth/logout-all', method: 'POST' }),
            async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                } finally {
                    dispatch(userLoggedOut());
                }
            },
        }),

        getMySessions: builder.query<Session[], void>({
            query: () => '/auth/devices',
            transformResponse: (response: ApiResponse<Session[]>) =>
                response.data,
            providesTags: ['Session'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRefreshMutation,
    useLogoutMutation,
    useLogoutAllMutation,
    useGetMySessionsQuery,
} = authApi;