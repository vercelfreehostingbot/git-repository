import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const apiSlice = createApi({
    reducerPath: 'ecmsApi',
    tagTypes: ['User', 'Session', 'IncomeVoucher', 'ExpenseVoucher'],
    baseQuery: baseQueryWithReauth,
    refetchOnMountOrArgChange: true,  // Fresh data when navigating back
    refetchOnFocus: true,             // Fresh data when switching tabs back
    // Endpoints are added by feature slices via injectEndpoints.
    endpoints: () => ({}),
});