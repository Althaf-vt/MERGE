export type FacadeSuspensionUnit = 'HOURS' | 'DAYS';
export type FacadeUserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';

export interface FacadeUserDto {
    id: string;
    email: string;
    accountStatus: FacadeUserStatus;
    kycCompleted: boolean;
    suspendedUntil: Date | null;
    statusReason: string | null;
    createdAt: Date;
}

export interface PaginatedUsersResult {
    data: FacadeUserDto[];
    total: number;
    page: number;
    limit: number;
}

export interface GetUsersFilters {
    page: number;
    limit: number;
    search?: string;
    status?: FacadeUserStatus;
    kycStatus?: string;
}

export const USER_MANAGEMENT_FACADE = 'USER_MANAGEMENT_FACADE';

// Strict Facade Contract: No Domain Entities leak through this interface.
export interface IUserManagementFacade {
    suspendUser(userId: string, duration: number, unit: FacadeSuspensionUnit, reason: string): Promise<void>;
    unsuspendUser(userId: string): Promise<void>;
    banUser(userId: string, reason: string): Promise<void>;
    unbanUser(userId: string): Promise<void>;
    getUsers(filters: GetUsersFilters): Promise<PaginatedUsersResult>;
    getUserById(userId: string): Promise<FacadeUserDto | null>;
}