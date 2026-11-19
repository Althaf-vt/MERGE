import { Inject, Injectable } from "@nestjs/common";
import { FacadeSuspensionUnit, FacadeUserDto, GetUsersFilters, IUserManagementFacade, PaginatedUsersResult } from "../interfaces/user-management-facade.interface";
import { ISuspendUserUseCase, SUSPEND_USER_USE_CASE } from "../interfaces/suspend-user.use-case.interface";
import { IUnsuspendUserUseCase, UNSUSPEND_USER_USE_CASE } from "../interfaces/unsuspend-user.use-case.interface";
import { BAN_USER_USE_CASE, IBanUserUseCase } from "../interfaces/ban-user.use-case.interface";
import { IUnbanUserUseCase, UNBAN_USER_USE_CASE } from "../interfaces/unban-user.use-case.interface";
import { GET_ADMIN_USERS_USE_CASE, IGetAdminUsersUseCase } from "../interfaces/get-admin-users.use-case.interface";
import { GET_ADMIN_USER_BY_ID_USE_CASE, IGetAdminUserByIdUseCase } from "../interfaces/get-admin-user-by-id.use-case.interface";

@Injectable()
export class UserManagementFacade implements IUserManagementFacade {
    constructor(
        @Inject(SUSPEND_USER_USE_CASE) private readonly _suspendUserUseCase: ISuspendUserUseCase,
        @Inject(UNSUSPEND_USER_USE_CASE) private readonly _unsuspendUserUseCase: IUnsuspendUserUseCase,
        @Inject(BAN_USER_USE_CASE) private readonly _banUserUseCase: IBanUserUseCase,
        @Inject(UNBAN_USER_USE_CASE) private readonly _unbanUserUseCase: IUnbanUserUseCase,
        @Inject(GET_ADMIN_USERS_USE_CASE) private readonly _getAdminUsersUseCase: IGetAdminUsersUseCase,
        @Inject(GET_ADMIN_USER_BY_ID_USE_CASE) private readonly _getAdminUserByIdUseCase: IGetAdminUserByIdUseCase,
    ) { }

    async suspendUser(userId: string, duration: number, unit: FacadeSuspensionUnit, reason: string): Promise<void> {
        return this._suspendUserUseCase.execute(userId, duration, unit, reason);
    }

    async unsuspendUser(userId: string): Promise<void> {
        return this._unsuspendUserUseCase.execute(userId);
    }

    async banUser(userId: string, reason: string): Promise<void> {
        return this._banUserUseCase.execute(userId, reason);
    }

    async unbanUser(userId: string): Promise<void> {
        return this._unbanUserUseCase.execute(userId);
    }

    async getUsers(filters: GetUsersFilters): Promise<PaginatedUsersResult> {
        return this._getAdminUsersUseCase.execute(filters);
    }

    async getUserById(userId: string): Promise<FacadeUserDto | null> {
        return this._getAdminUserByIdUseCase.execute(userId);
    }
}