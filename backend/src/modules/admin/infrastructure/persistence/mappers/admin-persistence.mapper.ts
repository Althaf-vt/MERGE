import { EmailVO } from "../../../../../shared/domain/value-objects/email.vo";
import { AdminAggregate, AdminStatusLog } from "../../../domain/entities/admin.entity";
import { AdminPermission } from "../../../domain/enums/admin-permission.enums";
import { AdminRole, AdminStatus } from "../../../domain/enums/admin.enums";
import { AdminDocument } from "../admin.schema";


export class AdminPersistenceMapper {

    public static toDomain(raw: AdminDocument): AdminAggregate {

        return new AdminAggregate({
            id: raw._id.toString(),
            email: new EmailVO(raw.email),
            passwordHash: raw.passwordHash ?? null,
            role: raw.role as AdminRole,
            fullName: raw.fullName,
            profilePhotoUrl: raw.profilePhotoUrl,
            status: raw.status as AdminStatus,
            permissions: (raw.permissions as AdminPermission[]) ?? [],
            lastLoginAt: raw.lastLoginAt,
            suspendedUntil: raw.suspendedUntil ?? null,
            statusHistory: (raw.statusHistory ?? []).map((log: any): AdminStatusLog => ({
                status: log.status as AdminStatus,
                reason: log.reason,
                actionBy: log.actionBy,
                timestamp: log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp),
            })),
            createdBy: raw.createdBy ? raw.createdBy.toString() : undefined,
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt'],
        })
    }

    public static toPersistence(entity: AdminAggregate): any {
        const data = entity.toJSON();
        return {
            email: data.email,
            passwordHash: data.passwordHash ?? null,
            role: data.role,
            fullName: data.fullName,
            profilePhotoUrl: data.profilePhotoUrl ?? null,
            status: data.status,
            permissions: data.permissions ?? [],
            lastLoginAt: data.lastLoginAt ?? null,
            suspendedUntil: data.suspendedUntil ?? null,
            statusHistory: (data.statusHistory ?? []).map((log: AdminStatusLog) => ({
                status: log.status,
                reason: log.reason,
                actionBy: log.actionBy,
                timestamp: log.timestamp,
            })),
            createdBy: data.createdBy ?? null,
        }
    }
}