export const SUSPEND_ADMIN_USE_CASE = 'SUSPEND_ADMIN_USE_CASE';
export const REACTIVATE_ADMIN_USE_CASE = 'REACTIVATE_ADMIN_USE_CASE';

export interface ISuspendAdminUseCase {
    execute(targetAdminId: string): Promise<void>;
}

export interface IReactivateAdminUseCase {
    execute(targetAdminId: string): Promise<void>;
}