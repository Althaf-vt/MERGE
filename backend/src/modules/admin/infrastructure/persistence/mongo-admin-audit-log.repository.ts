import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminAuditLog } from '../../domain/entities/admin-audit-log.entity';
import { AdminAuditResourceType } from '../../domain/enums/admin-audit.enums';
import { GetAdminAuditLogsFilters, IAdminAuditLogRepository, PaginatedAdminAuditLogsResult } from '../../domain/interfaces/admin-audit-log-repository.interface';
import { AdminAuditLogDocument, AdminAuditLogSchemaClass } from './admin-audit-log.schema';
import { AdminAuditLogPersistenceMapper } from './mappers/admin-audit-log-persistence.mapper';

@Injectable()
export class AdminAuditLogRepository implements IAdminAuditLogRepository {
    constructor(
        @InjectModel(AdminAuditLogSchemaClass.name)
        private readonly _model: Model<AdminAuditLogDocument>,
    ) { }

    async save(log: AdminAuditLog): Promise<AdminAuditLog> {
        const persistenceData = AdminAuditLogPersistenceMapper.toPersistence(log);
        const created = new this._model(persistenceData);
        const savedDoc = await created.save();
        return AdminAuditLogPersistenceMapper.toDomain(savedDoc);
    }

    async findById(id: string): Promise<AdminAuditLog | null> {
        const doc = await this._model.findById(id).exec();
        if (!doc) return null;
        return AdminAuditLogPersistenceMapper.toDomain(doc);
    }

    async findAllPaginated(filters: GetAdminAuditLogsFilters): Promise<PaginatedAdminAuditLogsResult> {
        const page = Math.max(1, filters.page || 1);
        const limit = Math.max(1, Math.min(100, filters.limit || 20));
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {};

        if (filters.resourceType) {
            query.resourceType = filters.resourceType;
        }

        if (filters.resourceId) {
            query.resourceId = filters.resourceId;
        }

        if (filters.action) {
            query.action = filters.action;
        }

        if (filters.adminId) {
            query.adminId = filters.adminId;
        }

        if (filters.startDate || filters.endDate) {
            const dateFilter: Record<string, Date> = {};
            if (filters.startDate) {
                dateFilter.$gte = filters.startDate;
            }
            if (filters.endDate) {
                dateFilter.$lte = filters.endDate;
            }
            query.createdAt = dateFilter;
        }

        const [documents, total] = await Promise.all([
            this._model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this._model.countDocuments(query).exec(),
        ]);

        return {
            data: AdminAuditLogPersistenceMapper.toDomainList(documents),
            total,
            page,
            limit,
        };
    }

    async findByResource(
        resourceType: AdminAuditResourceType,
        resourceId: string,
        page = 1,
        limit = 20,
    ): Promise<PaginatedAdminAuditLogsResult> {
        return this.findAllPaginated({
            resourceType,
            resourceId,
            page,
            limit,
        });
    }
}
