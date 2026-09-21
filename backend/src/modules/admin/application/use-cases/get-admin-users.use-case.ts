import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminUsersUseCase } from "../interfaces/get-admin-users.use-case.interface";
import { FacadeUserDto, GetUsersFilters, IUserManagementFacade, PaginatedUsersResult, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";

@Injectable()
export class GetAdminUsersUserCase implements IGetAdminUsersUseCase{
    constructor(
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
    ){}

    async execute(filters: GetUsersFilters): Promise<PaginatedUsersResult> {
        return this._userFacade.getUsers(filters);
    }

    async getById(userId: string): Promise<FacadeUserDto | null> {
        return this._userFacade.getUserById(userId);
    }
}