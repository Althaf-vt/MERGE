import { AdminAggregate } from "../../domain/entities/admin.entity";

export class AdminResponseMapper {
    public static toResponse(entity: AdminAggregate) {
        return {
            id: entity.id,
            email: entity.email,
            fullName: entity.fullName,
            role: entity.role,
            status: entity.status,
            permissions: entity.permissions,
            profilePhotoUrl: entity.profilePhotoUrl,
            lastLoginAt: entity.lastLogin,
            createdAt: entity.createdAt,
        };
    }
}