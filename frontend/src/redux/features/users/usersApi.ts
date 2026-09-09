import { apiSlice } from '../api/apiSlice/apiSlice';
import type { ApiResponse, User } from '../api/authApi/types';
import { userLoggedIn } from '../auth/authSlice';
import type { RootState } from '../../app/store';
import type {
    ChangePasswordRequest,
    CreateUserRequest,
    GetOperatorStatsResponse,
    GetUsersParams,
    GetUsersResponse,
    OperatorStats,
    UpdateMyProfileRequest,
    UpdateUserStatusRequest,
} from './types';

export const usersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<GetUsersResponse, GetUsersParams>({
            query: (params) => ({
                url: '/users',
                method: 'GET',
                params,
            }),
            transformResponse: (response: ApiResponse<GetUsersResponse>) =>
                response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.users.map((u) => ({ type: 'User' as const, id: u.id })),
                        { type: 'User' as const, id: 'LIST' },
                    ]
                    : [{ type: 'User' as const, id: 'LIST' }],
        }),

        // Admin-only, hits the same POST /users the backend already
        // restricts to Role.ADMIN. Backend wraps the created record as
        // { user: {...} } (see UsersService.create), so the response
        // envelope's `data` is { user: User } — unwrap .user here rather
        // than treating `data` itself as the User object.
        createUser: builder.mutation<User, CreateUserRequest>({
            query: (data) => ({
                url: '/users',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: ApiResponse<{ user: User }>) => response.data.user,
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),

        getOperatorStats: builder.query<OperatorStats, void>({
            query: () => '/users/stats',
            transformResponse: (response: ApiResponse<GetOperatorStatsResponse>) =>
                response.data.stats,
            providesTags: [{ type: 'User', id: 'LIST' }],
        }),

        // Backend wraps the updated record as { user: {...} } (see
        // UsersService.updateStatus) — same unwrap as createUser above.
        updateUserStatus: builder.mutation<User, UpdateUserStatusRequest>({
            query: ({ id, status }) => ({
                url: `/users/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            transformResponse: (response: ApiResponse<{ user: User }>) => response.data.user,
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'User', id },
                { type: 'User', id: 'LIST' },
            ],
        }),

        // Self-service — hits PATCH /users/me (see UsersController).
        // Every authenticated user (ADMIN or OPERATOR) can update their
        // own name; email/role are never editable through this endpoint.
        updateMyProfile: builder.mutation<User, UpdateMyProfileRequest>({
            query: (data) => ({
                url: '/users/me',
                method: 'PATCH',
                body: data,
            }),
            transformResponse: (response: ApiResponse<{ user: User }>) => response.data.user,
            async onQueryStarted(_arg, { queryFulfilled, dispatch, getState }) {
                try {
                    const { data: updatedUser } = await queryFulfilled;
                    // Keep Redux's cached user in sync immediately —
                    // without this, the Sidebar/Profile page would keep
                    // showing the old name until the next full page
                    // reload (when AuthInitializer re-fetches via
                    // /auth/refresh).
                    const state = getState() as RootState;
                    if (state.auth.accessToken) {
                        dispatch(
                            userLoggedIn({
                                accessToken: state.auth.accessToken,
                                user: updatedUser,
                            }),
                        );
                    }
                } catch {
                    // Failure surfaced via the mutation's own `error` field.
                }
            },
        }),

        // Self-service password change — hits PATCH /users/me/password.
        // Backend verifies currentPassword server-side and invalidates
        // all sessions on success (including this one), so the caller
        // should redirect to /login after this resolves.
        changePassword: builder.mutation<void, ChangePasswordRequest>({
            query: (data) => ({
                url: '/users/me/password',
                method: 'PATCH',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetOperatorStatsQuery,
    useCreateUserMutation,
    useUpdateUserStatusMutation,
    useUpdateMyProfileMutation,
    useChangePasswordMutation,
} = usersApi;