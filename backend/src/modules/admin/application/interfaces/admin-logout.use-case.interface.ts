export const ADMIN_LOGOUT_USE_CASE = 'ADMIN_LOGOUT_USE_CASE';

export interface IAdminLogoutUseCase {
    execute(token?: string): Promise<void>;
}