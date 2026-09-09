import type { Role, Status, User } from "../api/authApi/types";

export interface UsersMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface GetUsersResponse {
    users: User[];
    meta: UsersMeta;
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: Status;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: Role;
}

export interface UpdateUserStatusRequest {
    id: string;
    status: Status;
}

export interface UpdateMyProfileRequest {
    name: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface OperatorStats {
    totalOperators: number;
    activeOperators: number;
    inactiveOperators: number;
}

export interface GetOperatorStatsResponse {
    stats: OperatorStats;
}

export type { Role, Status, User };