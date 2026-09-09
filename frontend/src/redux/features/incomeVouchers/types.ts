export interface VoucherCreatedBy {
  id: string;
  name: string;
  email: string;
}

export type VoucherStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IncomeVoucher {
  id: string;
  voucherNumber: string;
  date: string; // ISO date string
  amount: number;
  incomeSource: string;
  description: string;
  reference: string;
  status: VoucherStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: VoucherCreatedBy;
}

export interface IncomeVouchersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalAmount: number;
}

export interface GetIncomeVouchersResponse {
  vouchers: IncomeVoucher[];
  meta: IncomeVouchersMeta;
}

export interface GetIncomeVouchersParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  createdById?: string;
  status?: VoucherStatus;
}

export interface CreateIncomeVoucherRequest {
  date: string;
  amount: number;
  incomeSource: string;
  description: string;
  reference: string;
}

export type UpdateIncomeVoucherRequest = Partial<CreateIncomeVoucherRequest>;

export interface IncomeVoucherStats {
  totalVouchers: number;
  totalAmount: number;
  todayVouchers: number;
  todayAmount: number;
}

export interface GetIncomeVoucherStatsResponse {
  stats: IncomeVoucherStats;
}

export interface GetIncomeVoucherResponse {
  voucher: IncomeVoucher;
}