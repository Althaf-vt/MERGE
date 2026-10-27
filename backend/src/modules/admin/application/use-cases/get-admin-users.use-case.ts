import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminUsersUseCase } from "../interfaces/get-admin-users.use-case.interface";
import { GetUsersFilters, IUserManagementFacade, PaginatedUsersResult, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";

@Injectable()
export class GetAdminUsersUserCase implements IGetAdminUsersUseCase {
    constructor(
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
    ) { }

    async execute(filters: GetUsersFilters): Promise<PaginatedUsersResult> {
        return this._userFacade.getUsers(filters);
    }
}