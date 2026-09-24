import { Injectable } from "@nestjs/common";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { Admin, AdminDocument } from "./admin.schema";
import { GetAdminsFilters, IAdminRepository, PaginatedAdminsResult } from "../../domain/interfaces/admin-repository.interface";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { AdminPersistenceMapper } from "./mappers/admin-persistence.mapper";
import { AdminRole } from "../../domain/enums/admin.enums";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class MongoAdminRepository extends BaseMongoRepository<AdminAggregate, AdminDocument> implements IAdminRepository {
    constructor(
        @InjectModel(Admin.name) model: Model<AdminDocument>,
        eventEmitter: EventEmitter2 // Inject the event emitter
    ) {
        super(model, eventEmitter); // Pass both to the BaseRepo
    }

    // fullfil the abstract mappign requirements from the Base Class
    protected toDomain(document: AdminDocument): AdminAggregate {
        return AdminPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: AdminAggregate): any {
        return AdminPersistenceMapper.toPersistence(entity)
    }

    async findByEmail(email: string): Promise<AdminAggregate | null> {
        const document = await this._model.findOne({ email }).exec();
        if (!document) return null;
        return AdminPersistenceMapper.toDomain(document);
    }

    async existsByRole(role: AdminRole): Promise<boolean> {
        const count = await this._model.countDocuments({ role }).exec();
        return count > 0;
    }

    async findAllPaginated(filters: GetAdminsFilters): Promise<PaginatedAdminsResult> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const query: any = {};

        if (filters.excludeAdminId) {
            query._id = { $ne: filters.excludeAdminId }
        }
        if (filters.role) query.role = filters.role;
        if (filters.status) query.status = filters.status;
        if (filters.search) {
            query.$or = [
                { email: { $regex: filters.search, $options: 'i' } },
                { fullName: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const [documents, total] = await Promise.all([
            this._model.find(query).skip(skip).limit(limit).exec(),
            this._model.countDocuments(query).exec()
        ]);

        return {
            data: documents.map(doc => this.toDomain(doc as any)),
            total,
            page,
            limit
        };
    }
}