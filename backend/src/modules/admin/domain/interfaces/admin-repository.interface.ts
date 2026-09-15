import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { AdminAggregate } from "../entities/admin.entity";
import { AdminRole } from "../enums/admin.enums";

export const ADMIN_REPOSITORY = 'ADMIN_REPOSITORY';

export interface IAdminRepository extends IBaseRepository<AdminAggregate> {
    findByEmail(email: string): Promise<AdminAggregate | null>;
    existsByRole(role: AdminRole): Promise<boolean>;
}