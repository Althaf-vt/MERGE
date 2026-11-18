import { AdminDetailsDto, PaginatedAdminsResponseDto } from "../dtos/admin-output.dto";
import { AdminResponseDto } from "../dtos/admin-login.dto";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { PaginatedAdminsResult } from "../../domain/interfaces/admin-repository.interface";

export class AdminDtoMapper {
    public static toDetailsDto(entity: AdminAggregate): AdminDetailsDto {
        return {
            id: entity.id as string,
            email: entity.email.getValue(),
            fullName: entity.fullName,
            role: entity.role,
            status: entity.status,
            permissions: entity.permissions as string[],
            profilePhotoUrl: entity.profilePhotoUrl ?? null,
            inviteExpiresAt: entity.inviteExpiresAt ?? null,
            lastLoginAt: entity.lastLogin ?? null,
            statusHistory: entity.statusHistory,
            createdAt: entity.createdAt as Date,
        };
    }

    public static toDetailsDtoList(entities: AdminAggregate[]): AdminDetailsDto[] {
        return entities.map((entity) => AdminDtoMapper.toDetailsDto(entity));
    }

    public static toPaginatedResponseDto(result: PaginatedAdminsResult): PaginatedAdminsResponseDto {
        return {
            data: AdminDtoMapper.toDetailsDtoList(result.data),
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }

    public static toAuthResponseDto(entity: AdminAggregate): AdminResponseDto {
        return {
            id: entity.id as string,
            email: entity.email.getValue(),
            fullName: entity.fullName,
            role: entity.role,
            status: entity.status,
            suspendedUntil: entity.suspendedUntil ?? null,
            statusHistory: entity.statusHistory.map((log) => ({
                status: log.status,
                reason: log.reason,
                actionBy: log.actionBy,
                timestamp: log.timestamp,
            })),
            permissions: entity.permissions,
            profilePhotoUrl: entity.profilePhotoUrl ?? null,
            lastLoginAt: entity.lastLogin ?? null,
            createdAt: entity.createdAt as Date,
        };
    }

    public static toAuthResponseDtoList(entities: AdminAggregate[]): AdminResponseDto[] {
        return entities.map((entity) => AdminDtoMapper.toAuthResponseDto(entity));
    }
}
