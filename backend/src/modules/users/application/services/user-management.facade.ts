import { Inject, Injectable } from "@nestjs/common";
import { GetUsersFilters, IUserManagementFacade, PaginatedUsersResult } from "../interfaces/user-management-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { SuspensionDurationVO, SuspensionUnit } from "../../domain/value-objects/suspension-duration.vo";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { UserAggregate } from "../../domain/entities/user.entity";

@Injectable()
export class UserManagementFacade implements IUserManagementFacade{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ){}

    async suspendUser(userId: string, duration: number, unit: SuspensionUnit, reason: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        const durationVO = new SuspensionDurationVO(duration, unit);
        user.suspendAccount(durationVO, reason);
        await this._userRepository.update(user);
    }

    async unsuspendUser(userId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        user.unsuspendAccount();
        await this._userRepository.update(user);
    }

    async banUser(userId: string, reason: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        user.banAccount(reason);
        await this._userRepository.update(user);
    }

    async unbanUser(userId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        user.unbanAccount();
        await this._userRepository.update(user);
    }

    async getUsers(filters: GetUsersFilters): Promise<PaginatedUsersResult> {
        // Assume you add `findAllPaginated` to IUserRepository
        return this._userRepository.findAllPaginated(filters)
    }

    async getUserById(userId: string): Promise<UserAggregate | null> {
        return this._userRepository.findById(userId);
    }
}