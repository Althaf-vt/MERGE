import { EmailVO } from "../../../../users/domain/value-objects/email.vo";
import { AdminAggregate } from "../../../domain/entities/admin.entity";
import { AdminPermission } from "../../../domain/enums/admin-permission.enums";
import { AdminRole, AdminStatus } from "../../../domain/enums/admin.enums";
import { AdminDocument } from "../admin.schema";


export class AdminPersistenceMapper {

    public static toDomain(raw: AdminDocument): AdminAggregate {

        return new AdminAggregate({
            id: raw._id.toString(),
            email: new EmailVO(raw.email),
            passwordHash: raw.passwordHash,
            role: raw.role as AdminRole,
            fullName: raw.fullName,
            profilePhotoUrl: raw.profilePhotoUrl,
            status: raw.status as AdminStatus,
            permissions: (raw.permissions as AdminPermission[]) ?? [],
            lastLoginAt: raw.lastLoginAt,
            createdBy: raw.createdBy ? raw.createdBy.toString() : undefined,
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt'],
        })
    }

    public static toPersistence(entity: AdminAggregate): any {
        const data = entity.toJSON();
        return {
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role,
            fullName: data.fullName,
            profilePhotoUrl: data.profilePhotoUrl ?? null,
            status: data.status,
            permissions: data.permissions ?? [],
            lastLoginAt: data.lastLoginAt ?? null,
            createdBy: data.createdBy ?? null,
        }
    }
}