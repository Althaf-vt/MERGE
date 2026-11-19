import { GetUsersFilters, PaginatedUsersResult } from "./user-management-facade.interface";

export const GET_ADMIN_USERS_USE_CASE = Symbol('GET_ADMIN_USERS_USE_CASE');

export interface IGetAdminUsersUseCase {
    execute(filters: GetUsersFilters): Promise<PaginatedUsersResult>;
}

