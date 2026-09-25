import { AdminDetailsDto } from "../dtos/admin-output.dto";

export const GET_ADMIN_DETAILS_USE_CASE = 'GET_ADMIN_DETAILS_USE_CASE';
export const FORCE_LOGOUT_ADMIN_USE_CASE = 'FORCE_LOGOUT_ADMIN_USE_CASE';

export interface IGetAdminDetailsUseCase {
    execute(targetAdminId: string): Promise<AdminDetailsDto>;
}

export interface IForceLogoutAdminUseCase {
    execute(targetAdminId: string, actionByAdminId: string): Promise<void>;
}