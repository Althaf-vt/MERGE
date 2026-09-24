import { AdminAggregate } from "../../domain/entities/admin.entity";

export class AdminResponseMapper {
    public static toResponse(entity: AdminAggregate) {
        return {
            id: entity.id as string,
            email: entity.email.getValue(),
            fullName: entity.fullName,
            role: entity.role,
            status: entity.status,
            permissions: entity.permissions,
            profilePhotoUrl: entity.profilePhotoUrl ?? null,
            lastLoginAt: entity.lastLogin ?? null,
            createdAt: entity.createdAt as Date,
        };
    }
}