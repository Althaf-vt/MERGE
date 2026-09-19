import { UserAggregate } from "../../domain/entities/user.entity";
import { UserStatus } from "../../domain/enums/user.enums";
import { SuspensionUnit } from "../../domain/value-objects/suspension-duration.vo";

export interface PaginatedUsersResult{
    data: UserAggregate[];
    total: number;
    page: number;
    limit: number;
}

export interface GetUsersFilters{
    page: number;
    limit: number;
    search?: string;
    status?: UserStatus;
    kycStatus?: string;
}

export const USER_MANAGEMENT_FACADE = 'USER_MANAGEMENT_FACADE';

// Public API exposed by the Users module for other modules to use
export interface IUserManagementFacade {
    suspendUser(userId: string, duration: number, unit: SuspensionUnit, reason: string): Promise<void>;
    unsuspendUser(userId: string): Promise<void>;
    banUser(userId: string, reason: string): Promise<void>;
    unbanUser(userId: string): Promise<void>;
    getUsers(filters: GetUsersFilters): Promise<PaginatedUsersResult>;
    getUserById(userId: string): Promise<UserAggregate | null>;
}