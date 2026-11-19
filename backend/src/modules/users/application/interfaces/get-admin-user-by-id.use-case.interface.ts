import { FacadeUserDto } from "./user-management-facade.interface";

export const GET_ADMIN_USER_BY_ID_USE_CASE = Symbol('GET_ADMIN_USER_BY_ID_USE_CASE');

export interface IGetAdminUserByIdUseCase {
    execute(userId: string): Promise<FacadeUserDto | null>;
}

