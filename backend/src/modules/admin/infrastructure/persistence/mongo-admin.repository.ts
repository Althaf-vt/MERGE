import { Injectable } from "@nestjs/common";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { Admin, AdminDocument } from "./admin.schema";
import { IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { AdminPersistenceMapper } from "./mappers/admin-persistence.mapper";
import { AdminRole } from "../../domain/enums/admin.enums";

@Injectable()
export class MongoAdminRepository extends BaseMongoRepository<AdminAggregate, AdminDocument> implements IAdminRepository {
    constructor(
        @InjectModel(Admin.name)
        model: Model<AdminDocument>
    ) {
        super(model); // Passes the model to the BaseRepo
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
}