import { UserAggregate } from "../../domain/entities/user.entity";
import { FacadeUserDto, FacadeUserStatus, PaginatedUsersResult } from "../interfaces/user-management-facade.interface";
import { PaginatedResult } from "../../domain/interfaces/user-repository.interface";

export class UserFacadeMapper {
    public static toDto(user: UserAggregate): FacadeUserDto {
        return {
            id: user.id as string,
            email: user.email.getValue(),
            accountStatus: user.accountStatus as FacadeUserStatus,
            kycCompleted: user.kycCompleted,
            suspendedUntil: user.suspendedUntil ?? null,
            statusReason: user.statusReason ?? null,
            createdAt: user.createdAt as Date,
        };
    }

    public static toDtoList(users: UserAggregate[]): FacadeUserDto[] {
        return users.map((user) => UserFacadeMapper.toDto(user));
    }

    public static toPaginatedResponseDto(result: PaginatedResult<UserAggregate>): PaginatedUsersResult {
        return {
            data: UserFacadeMapper.toDtoList(result.data),
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }
}
