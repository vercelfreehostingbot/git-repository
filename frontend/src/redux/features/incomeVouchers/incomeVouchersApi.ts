import { apiSlice } from '../api/apiSlice/apiSlice';
import type { ApiResponse } from '../api/authApi/types';
import type {
    CreateIncomeVoucherRequest,
    GetIncomeVoucherResponse,
    GetIncomeVoucherStatsResponse,
    GetIncomeVouchersParams,
    GetIncomeVouchersResponse,
    IncomeVoucher,
    IncomeVoucherStats,
    UpdateIncomeVoucherRequest,
} from './types';

export const incomeVouchersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getIncomeVouchers: builder.query<GetIncomeVouchersResponse, GetIncomeVouchersParams>({
            query: (params) => ({
                url: '/income-vouchers',
                method: 'GET',
                params,
            }),
            transformResponse: (response: ApiResponse<GetIncomeVouchersResponse>) =>
                response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.vouchers.map((v) => ({ type: 'IncomeVoucher' as const, id: v.id })),
                        { type: 'IncomeVoucher' as const, id: 'LIST' },
                    ]
                    : [{ type: 'IncomeVoucher' as const, id: 'LIST' }],
        }),

        getIncomeVoucherStats: builder.query<IncomeVoucherStats, void>({
            query: () => '/income-vouchers/stats',
            transformResponse: (response: ApiResponse<GetIncomeVoucherStatsResponse>) =>
                response.data.stats,
            providesTags: [{ type: 'IncomeVoucher', id: 'LIST' }],
        }),

        getIncomeVoucher: builder.query<IncomeVoucher, string>({
            query: (id) => `/income-vouchers/${id}`,
            transformResponse: (response: ApiResponse<GetIncomeVoucherResponse>) =>
                response.data.voucher,
            providesTags: (_result, _error, id) => [{ type: 'IncomeVoucher', id }],
        }),

        createIncomeVoucher: builder.mutation<IncomeVoucher, CreateIncomeVoucherRequest>({
            query: (data) => ({
                url: '/income-vouchers',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: ApiResponse<GetIncomeVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: [{ type: 'IncomeVoucher', id: 'LIST' }],
        }),

        updateIncomeVoucher: builder.mutation<
            IncomeVoucher,
            { id: string; data: UpdateIncomeVoucherRequest }
        >({
            query: ({ id, data }) => ({
                url: `/income-vouchers/${id}`,
                method: 'PATCH',
                body: data,
            }),
            transformResponse: (response: ApiResponse<GetIncomeVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'IncomeVoucher', id },
                { type: 'IncomeVoucher', id: 'LIST' },
            ],
        }),

        deleteIncomeVoucher: builder.mutation<null, string>({
            query: (id) => ({
                url: `/income-vouchers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'IncomeVoucher', id },
                { type: 'IncomeVoucher', id: 'LIST' },
            ],
        }),

        // Fetches the PDF as a Blob for download. Uses a custom
        // responseHandler because this endpoint returns raw PDF bytes
        // on success — NOT our usual { success, message, data }
        // envelope — but on error (4xx/5xx) the backend's
        // HttpExceptionFilter still returns the normal JSON error
        // shape. Parsing conditionally on response.ok keeps
        // getErrorMessage() working unchanged for failures, while
        // successes come back as a Blob ready to save.
        downloadIncomeVoucherPdf: builder.query<Blob, string>({
            query: (id) => ({
                url: `/income-vouchers/${id}/pdf`,
                method: 'GET',
                params: { download: 'true' },
                responseHandler: async (response: Response) =>
                    response.ok ? response.blob() : response.json(),
            }),
        }),

        // Same Blob/error-handling pattern as the single-voucher PDF —
        // accepts the same filter params as getIncomeVouchers (minus
        // page/limit, since the summary always covers every matching
        // record, not just one page's worth).
        downloadIncomeVoucherSummaryPdf: builder.query<
            Blob,
            Omit<GetIncomeVouchersParams, 'page' | 'limit'>
        >({
            query: (params) => ({
                url: '/income-vouchers/summary-pdf',
                method: 'GET',
                params: { ...params, download: 'true' },
                responseHandler: async (response: Response) =>
                    response.ok ? response.blob() : response.json(),
            }),
        }),
        // Lightweight — powers the notification-bell. Deliberately just
        // a count (not the full pending list), so polling stays cheap;
        // the bell's dropdown calls getIncomeVouchers({ status: 'PENDING' })
        // for the actual list only when opened.
        getIncomePendingCount: builder.query<{ count: number }, void>({
            query: () => '/income-vouchers/pending-count',
            transformResponse: (response: ApiResponse<{ count: number }>) => response.data,
            providesTags: [{ type: 'IncomeVoucher', id: 'LIST' }],
        }),

        approveIncomeVoucher: builder.mutation<IncomeVoucher, string>({
            query: (id) => ({
                url: `/income-vouchers/${id}/approve`,
                method: 'PATCH',
            }),
            transformResponse: (response: ApiResponse<GetIncomeVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: (_result, _error, id) => [
                { type: 'IncomeVoucher', id },
                { type: 'IncomeVoucher', id: 'LIST' },
            ],
        }),

        rejectIncomeVoucher: builder.mutation<IncomeVoucher, string>({
            query: (id) => ({
                url: `/income-vouchers/${id}/reject`,
                method: 'PATCH',
            }),
            transformResponse: (response: ApiResponse<GetIncomeVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: (_result, _error, id) => [
                { type: 'IncomeVoucher', id },
                { type: 'IncomeVoucher', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetIncomeVouchersQuery,
    useGetIncomeVoucherStatsQuery,
    useGetIncomeVoucherQuery,
    useCreateIncomeVoucherMutation,
    useUpdateIncomeVoucherMutation,
    useDeleteIncomeVoucherMutation,
    useLazyDownloadIncomeVoucherPdfQuery,
    useLazyDownloadIncomeVoucherSummaryPdfQuery,
    useGetIncomePendingCountQuery,
    useApproveIncomeVoucherMutation,
    useRejectIncomeVoucherMutation,
} = incomeVouchersApi;