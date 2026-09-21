import { FacadeUserDto, GetUsersFilters, PaginatedUsersResult } from "../../../users/application/interfaces/user-management-facade.interface";

export const GET_ADMIN_USERS_USE_CASE = 'GET_ADMIN_USERS_USE_CASE';

export interface IGetAdminUsersUseCase {
    execute(filters: GetUsersFilters): Promise<PaginatedUsersResult>;
    getById(userId: string): Promise<FacadeUserDto | null>;
}