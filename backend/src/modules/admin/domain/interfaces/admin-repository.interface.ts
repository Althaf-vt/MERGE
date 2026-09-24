import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { AdminAggregate } from "../entities/admin.entity";
import { AdminRole, AdminStatus } from "../enums/admin.enums";

export const ADMIN_REPOSITORY = 'ADMIN_REPOSITORY';

export interface GetAdminsFilters {
    page?: number;
    limit?: number;
    role?: AdminRole;
    status?: AdminStatus;
    search?: string;
    excludeAdminId?: string;
}

export interface PaginatedAdminsResult {
    data: AdminAggregate[];
    total: number;
    page: number;
    limit: number;
}

export interface IAdminRepository extends IBaseRepository<AdminAggregate> {
    findByEmail(email: string): Promise<AdminAggregate | null>;
    existsByRole(role: AdminRole): Promise<boolean>;
    findAllPaginated(filters: GetAdminsFilters): Promise<PaginatedAdminsResult>;
}