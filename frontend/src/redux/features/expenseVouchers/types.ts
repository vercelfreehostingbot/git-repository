export interface VoucherCreatedBy {
  id: string;
  name: string;
  email: string;
}

export type VoucherStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ExpenseVoucher {
  id: string;
  voucherNumber: string;
  date: string; // ISO date string
  amount: number;
  expenseHead: string;
  description: string;
  reference: string;
  status: VoucherStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: VoucherCreatedBy;
}

export interface ExpenseVouchersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  // Sum of `amount` across every record matching the current
  // search/date-filter/role-scope — not just the current page's rows.
  totalAmount: number;
}

export interface GetExpenseVouchersResponse {
  vouchers: ExpenseVoucher[];
  meta: ExpenseVouchersMeta;
}

export interface GetExpenseVouchersParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  createdById?: string;
  status?: VoucherStatus;
}

export interface CreateExpenseVoucherRequest {
  date: string;
  amount: number;
  expenseHead: string;
  description: string;
  reference: string;
}

export type UpdateExpenseVoucherRequest = Partial<CreateExpenseVoucherRequest>;

export interface ExpenseVoucherStats {
  totalVouchers: number;
  totalAmount: number;
  todayVouchers: number;
  todayAmount: number;
}

export interface GetExpenseVoucherStatsResponse {
  stats: ExpenseVoucherStats;
}

export interface GetExpenseVoucherResponse {
  voucher: ExpenseVoucher;
}