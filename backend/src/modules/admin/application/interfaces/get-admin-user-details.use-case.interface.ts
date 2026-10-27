import { FacadeUserDto } from "../../../users/application/interfaces/user-management-facade.interface";

export const GET_ADMIN_USER_DETAILS_USE_CASE = 'GET_ADMIN_USER_DETAILS_USE_CASE';

export interface IGetAdminUserDetailsUseCase {
    execute(userId: string): Promise<FacadeUserDto>;
}