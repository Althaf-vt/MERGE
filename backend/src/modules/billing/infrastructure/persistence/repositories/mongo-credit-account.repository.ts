import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCode } from '../../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../../domain/constants/billing-error-messages.constants';
import { BILLING_ID_PREFIXES, generateBillingId } from '../../../domain/constants/billing.constants';
import { CreditAccount } from '../../../domain/entities/credit-account.entity';
import { ICreditAccountRepository } from '../../../domain/interfaces/credit-account-repository.interface';
import { CreditAccountPersistenceMapper } from '../mappers/credit-account-persistence.mapper';
import { CreditAccountDocument, CreditAccountSchemaClass } from '../schemas/credit-account.schema';

@Injectable()
export class MongoCreditAccountRepository implements ICreditAccountRepository {
    constructor(
        @InjectModel(CreditAccountSchemaClass.name) private readonly _model: Model<CreditAccountDocument>,
    ) { }

    async findById(id: string): Promise<CreditAccount | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return CreditAccountPersistenceMapper.toDomain(document);
    }

    async findByUserId(userId: string): Promise<CreditAccount | null> {
        const document = await this._model.findOne({ userId }).exec();
        if (!document) return null;
        return CreditAccountPersistenceMapper.toDomain(document);
    }

    async getOrCreate(userId: string): Promise<CreditAccount> {
        const existing = await this.findByUserId(userId);
        if (existing) {
            return existing;
        }

        const newAccount = CreditAccount.initialize(
            generateBillingId(BILLING_ID_PREFIXES.CREDIT_ACCOUNT),
            userId,
            0,
        );
        return this.create(newAccount);
    }

    async create(account: CreditAccount): Promise<CreditAccount> {
        const persistenceData = CreditAccountPersistenceMapper.toPersistence(account);
        const created = new this._model(persistenceData);
        const saved = await created.save();
        return CreditAccountPersistenceMapper.toDomain(saved);
    }

    async update(account: CreditAccount): Promise<CreditAccount> {
        const persistenceData = CreditAccountPersistenceMapper.toPersistence(account);
        const updated = await this._model
            .findByIdAndUpdate(account.id, persistenceData, { new: true })
            .exec();

        if (!updated) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ACCOUNT_ID_REQUIRED);
        }

        return CreditAccountPersistenceMapper.toDomain(updated);
    }
}
