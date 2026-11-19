import { Inject, Injectable } from "@nestjs/common";
import { FacadeSuspensionUnit, FacadeUserDto, GetUsersFilters, IUserManagementFacade, PaginatedUsersResult } from "../interfaces/user-management-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UserStatus } from "../../domain/enums/user.enums";
import { UserFacadeMapper } from "../mappers/user-facade.mapper";
import { ISuspendUserUseCase, SUSPEND_USER_USE_CASE } from "../interfaces/suspend-user.use-case.interface";
import { IUnsuspendUserUseCase, UNSUSPEND_USER_USE_CASE } from "../interfaces/unsuspend-user.use-case.interface";
import { BAN_USER_USE_CASE, IBanUserUseCase } from "../interfaces/ban-user.use-case.interface";
import { IUnbanUserUseCase, UNBAN_USER_USE_CASE } from "../interfaces/unban-user.use-case.interface";

@Injectable()
export class UserManagementFacade implements IUserManagementFacade {
    constructor(
        @Inject(SUSPEND_USER_USE_CASE) private readonly _suspendUserUseCase: ISuspendUserUseCase,
        @Inject(UNSUSPEND_USER_USE_CASE) private readonly _unsuspendUserUseCase: IUnsuspendUserUseCase,
        @Inject(BAN_USER_USE_CASE) private readonly _banUserUseCase: IBanUserUseCase,
        @Inject(UNBAN_USER_USE_CASE) private readonly _unbanUserUseCase: IUnbanUserUseCase,
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
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
        // Map Facade filters to internal Domain filters
        const internalFilters = {
            ...filters,
            status: filters.status as UserStatus,
        };

        const result = await this._userRepository.findAllPaginated(internalFilters);

        return UserFacadeMapper.toPaginatedResponseDto(result);
    }

    async getUserById(userId: string): Promise<FacadeUserDto | null> {
        const user = await this._userRepository.findById(userId);
        if (!user) return null;
        return UserFacadeMapper.toDto(user);
    }
}