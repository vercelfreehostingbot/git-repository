import { apiSlice } from '../api/apiSlice/apiSlice';
import type { ApiResponse } from '../api/authApi/types';
import type {
    CreateExpenseVoucherRequest,
    ExpenseVoucher,
    ExpenseVoucherStats,
    GetExpenseVoucherResponse,
    GetExpenseVoucherStatsResponse,
    GetExpenseVouchersParams,
    GetExpenseVouchersResponse,
    UpdateExpenseVoucherRequest,
} from './types';

export const expenseVouchersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExpenseVouchers: builder.query<GetExpenseVouchersResponse, GetExpenseVouchersParams>({
            query: (params) => ({
                url: '/expense-vouchers',
                method: 'GET',
                params,
            }),
            transformResponse: (response: ApiResponse<GetExpenseVouchersResponse>) =>
                response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.vouchers.map((v) => ({ type: 'ExpenseVoucher' as const, id: v.id })),
                        { type: 'ExpenseVoucher' as const, id: 'LIST' },
                    ]
                    : [{ type: 'ExpenseVoucher' as const, id: 'LIST' }],
        }),

        getExpenseVoucherStats: builder.query<ExpenseVoucherStats, void>({
            query: () => '/expense-vouchers/stats',
            transformResponse: (response: ApiResponse<GetExpenseVoucherStatsResponse>) =>
                response.data.stats,
            providesTags: [{ type: 'ExpenseVoucher', id: 'LIST' }],
        }),

        getExpenseVoucher: builder.query<ExpenseVoucher, string>({
            query: (id) => `/expense-vouchers/${id}`,
            transformResponse: (response: ApiResponse<GetExpenseVoucherResponse>) =>
                response.data.voucher,
            providesTags: (_result, _error, id) => [{ type: 'ExpenseVoucher', id }],
        }),

        createExpenseVoucher: builder.mutation<ExpenseVoucher, CreateExpenseVoucherRequest>({
            query: (data) => ({
                url: '/expense-vouchers',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: ApiResponse<GetExpenseVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: [{ type: 'ExpenseVoucher', id: 'LIST' }],
        }),

        updateExpenseVoucher: builder.mutation<
            ExpenseVoucher,
            { id: string; data: UpdateExpenseVoucherRequest }
        >({
            query: ({ id, data }) => ({
                url: `/expense-vouchers/${id}`,
                method: 'PATCH',
                body: data,
            }),
            transformResponse: (response: ApiResponse<GetExpenseVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'ExpenseVoucher', id },
                { type: 'ExpenseVoucher', id: 'LIST' },
            ],
        }),

        deleteExpenseVoucher: builder.mutation<null, string>({
            query: (id) => ({
                url: `/expense-vouchers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'ExpenseVoucher', id },
                { type: 'ExpenseVoucher', id: 'LIST' },
            ],
        }),

        downloadExpenseVoucherPdf: builder.query<Blob, string>({
            query: (id) => ({
                url: `/expense-vouchers/${id}/pdf`,
                method: 'GET',
                params: { download: 'true' },
                responseHandler: async (response: Response) =>
                    response.ok ? response.blob() : response.json(),
            }),
        }),

        downloadExpenseVoucherSummaryPdf: builder.query<
            Blob,
            Omit<GetExpenseVouchersParams, 'page' | 'limit'>
        >({
            query: (params) => ({
                url: '/expense-vouchers/summary-pdf',
                method: 'GET',
                params: { ...params, download: 'true' },
                responseHandler: async (response: Response) =>
                    response.ok ? response.blob() : response.json(),
            }),
        }),
        getExpensePendingCount: builder.query<{ count: number }, void>({
            query: () => '/expense-vouchers/pending-count',
            transformResponse: (response: ApiResponse<{ count: number }>) => response.data,
            providesTags: [{ type: 'ExpenseVoucher', id: 'LIST' }],
        }),

        approveExpenseVoucher: builder.mutation<ExpenseVoucher, string>({
            query: (id) => ({
                url: `/expense-vouchers/${id}/approve`,
                method: 'PATCH',
            }),
            transformResponse: (response: ApiResponse<GetExpenseVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: (_result, _error, id) => [
                { type: 'ExpenseVoucher', id },
                { type: 'ExpenseVoucher', id: 'LIST' },
            ],
        }),

        rejectExpenseVoucher: builder.mutation<ExpenseVoucher, string>({
            query: (id) => ({
                url: `/expense-vouchers/${id}/reject`,
                method: 'PATCH',
            }),
            transformResponse: (response: ApiResponse<GetExpenseVoucherResponse>) =>
                response.data.voucher,
            invalidatesTags: (_result, _error, id) => [
                { type: 'ExpenseVoucher', id },
                { type: 'ExpenseVoucher', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetExpenseVouchersQuery,
    useGetExpenseVoucherStatsQuery,
    useGetExpenseVoucherQuery,
    useCreateExpenseVoucherMutation,
    useUpdateExpenseVoucherMutation,
    useDeleteExpenseVoucherMutation,
    useLazyDownloadExpenseVoucherPdfQuery,
    useLazyDownloadExpenseVoucherSummaryPdfQuery,
    useGetExpensePendingCountQuery,
    useApproveExpenseVoucherMutation,
    useRejectExpenseVoucherMutation,
} = expenseVouchersApi;