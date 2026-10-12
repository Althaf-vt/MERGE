import type { ApiResponse } from '../../../../shared/types/api-response.types';

export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
export type SuspensionUnit = 'HOURS' | 'DAYS';

export interface AdminUserDto {
    id: string;
    email: string;
    accountStatus: AdminUserStatus;
    kycCompleted: boolean;
    suspendedUntil: string | null;
    statusReason: string | null;
    createdAt: string;
}

export type PaginatedUsersResponse = ApiResponse<AdminUserDto[]>;

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: AdminUserStatus | '';
    kycStatus?: string;
}

export interface SuspendUserPayload {
    userId: string;
    duration: number;
    unit: SuspensionUnit;
    reason: string;
}

export interface ActionReasonPayload {
    userId: string;
    reason: string;
}