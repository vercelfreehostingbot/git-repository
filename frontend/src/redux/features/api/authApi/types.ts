export type Role = 'ADMIN' | 'OPERATOR';
export type Status = 'ACTIVE' | 'INACTIVE';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: Status;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
}

export interface InitialState {
    accessToken: string | null;
    user: User | null;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
}

export interface RefreshResponse {
    accessToken: string;
    user: User;
}

export interface Session {
    id: string;
    deviceInfo: string | null;
    ipAddress: string | null;
    createdAt: string;
    updatedAt: string;
}