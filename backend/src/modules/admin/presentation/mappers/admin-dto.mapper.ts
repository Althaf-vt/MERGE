import { AdminDetailsDto } from "../../application/dtos/admin-output.dto";
import { AdminAggregate } from "../../domain/entities/admin.entity";

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
            lastLoginAt: entity.lastLogin ?? null,
            createdAt: entity.createdAt as Date,
        };
    }
}