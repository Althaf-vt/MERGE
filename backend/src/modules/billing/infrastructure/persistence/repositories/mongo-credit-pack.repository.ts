import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCode } from '../../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../../domain/constants/billing-error-messages.constants';
import { CreditPack } from '../../../domain/entities/credit-pack.entity';
import { ICreditPackRepository } from '../../../domain/interfaces/credit-pack-repository.interface';
import { CreditPackPersistenceMapper } from '../mappers/credit-pack-persistence.mapper';
import { CreditPackDocument, CreditPackSchemaClass } from '../schemas/credit-pack.schema';

@Injectable()
export class MongoCreditPackRepository implements ICreditPackRepository {
    constructor(
        @InjectModel(CreditPackSchemaClass.name) private readonly _model: Model<CreditPackDocument>,
    ) { }

    async findById(id: string): Promise<CreditPack | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return CreditPackPersistenceMapper.toDomain(document);
    }

    async findByCode(code: string): Promise<CreditPack | null> {
        const document = await this._model.findOne({ code: code.trim().toUpperCase() }).exec();
        if (!document) return null;
        return CreditPackPersistenceMapper.toDomain(document);
    }

    async findListed(): Promise<CreditPack[]> {
        const documents = await this._model
            .find({ isListed: true, isActive: true })
            .sort({ sortOrder: 1, createdAt: 1 })
            .exec();

        return CreditPackPersistenceMapper.toDomainList(documents);
    }

    async findAll(): Promise<CreditPack[]> {
        const documents = await this._model
            .find()
            .sort({ sortOrder: 1, createdAt: 1 })
            .exec();

        return CreditPackPersistenceMapper.toDomainList(documents);
    }

    async create(pack: CreditPack): Promise<CreditPack> {
        const persistenceData = CreditPackPersistenceMapper.toPersistence(pack);
        const created = new this._model(persistenceData);
        const saved = await created.save();
        return CreditPackPersistenceMapper.toDomain(saved);
    }

    async update(pack: CreditPack): Promise<CreditPack> {
        const persistenceData = CreditPackPersistenceMapper.toPersistence(pack);
        const updated = await this._model
            .findByIdAndUpdate(pack.id, persistenceData, { new: true })
            .exec();

        if (!updated) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_NOT_FOUND);
        }

        return CreditPackPersistenceMapper.toDomain(updated);
    }

    async count(): Promise<number> {
        return this._model.countDocuments().exec();
    }
}
