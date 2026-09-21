import { Inject, Injectable } from "@nestjs/common";
import { FacadeSuspensionUnit, FacadeUserDto, GetUsersFilters, IUserManagementFacade, PaginatedUsersResult } from "../interfaces/user-management-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { SuspensionDurationVO, SuspensionUnit } from "../../domain/value-objects/suspension-duration.vo";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { UserAggregate } from "../../domain/entities/user.entity";
import { UserStatus } from "../../domain/enums/user.enums";

@Injectable()
export class UserManagementFacade implements IUserManagementFacade {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) { }

    // Maps the internal Aggregate to the boundary-safe DTO
    private _mapToDto(user: UserAggregate): FacadeUserDto {
        return {
            id: user.id as string,
            email: user.email.getValue(),
            accountStatus: user.accountStatus as any,
            kycCompleted: user.kycCompleted,
            suspendedUntil: user.suspendedUntil ?? null,
            statusReason: user.statusReason ?? null,
            createdAt: user.createdAt as Date,
        };
    }

    async suspendUser(userId: string, duration: number, unit: FacadeSuspensionUnit, reason: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        // Map boundary type to internal Domain Value Object
        const internalUnit = unit === 'HOURS' ? SuspensionUnit.HOURS : SuspensionUnit.DAYS;
        const durationVO = new SuspensionDurationVO(duration, internalUnit);

        user.suspendAccount(durationVO, reason);
        await this._userRepository.update(user);
    }

    async unsuspendUser(userId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        user.unsuspendAccount();
        await this._userRepository.update(user);
    }

    async banUser(userId: string, reason: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        user.banAccount(reason);
        await this._userRepository.update(user);
    }

    async unbanUser(userId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target user not found.");

        user.unbanAccount();
        await this._userRepository.update(user);
    }

    async getUsers(filters: GetUsersFilters): Promise<PaginatedUsersResult> {
        // Map Facade filters to internal Domain filters
        const internalFilters = {
            ...filters,
            status: filters.status as UserStatus,
        }

        const result = await this._userRepository.findAllPaginated(internalFilters);

        return {
            data: result.data.map(user => this._mapToDto(user)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }

    async getUserById(userId: string): Promise<FacadeUserDto | null> {
        const user = await this._userRepository.findById(userId);
        if (!user) return null;
        return this._mapToDto(user);
    }
}