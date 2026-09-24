import { SuspendAdminDto } from "../dtos/admin-status.dto";

export const SUSPEND_ADMIN_USE_CASE = 'SUSPEND_ADMIN_USE_CASE';
export const REACTIVATE_ADMIN_USE_CASE = 'REACTIVATE_ADMIN_USE_CASE';
export const DEACTIVATE_ADMIN_USE_CASE = 'DEACTIVATE_ADMIN_USE_CASE';

export interface ISuspendAdminUseCase {
    execute(targetAdminId: string, dto: SuspendAdminDto, actionByAdminId: string): Promise<void>;
}

export interface IReactivateAdminUseCase {
    execute(targetAdminId: string, reason: string, actionByAdminId: string): Promise<void>;
}

export interface IDeactivateAdminUseCase {
    execute(targetAdminId: string, reason: string, actionByAdminId: string): Promise<void>;
}