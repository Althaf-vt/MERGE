import { PaginatedAdminsResponseDto } from "../dtos/admin-output.dto";
import { GetAdminsDto } from "../dtos/get-admins.dto";

export const GET_ADMINS_USE_CASE = 'GET_ADMINS_USE_CASE';

export interface IGetAdminsUseCase {
    execute(filters: GetAdminsDto, currentAdminId: string): Promise<PaginatedAdminsResponseDto>;
}