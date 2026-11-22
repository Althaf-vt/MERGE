import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCode } from '../../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../../shared/domain/exceptions/domain.exception';
import { BILLING_POLICY } from '../../../domain/constants/billing.constants';
import { BILLING_ERROR_MESSAGES } from '../../../domain/constants/billing-error-messages.constants';
import { BillingTransaction } from '../../../domain/entities/billing-transaction.entity';
import { BillingHistoryFilter, IBillingTransactionRepository, PaginatedBillingTransactionsResult } from '../../../domain/interfaces/billing-transaction-repository.interface';
import { BillingTransactionPersistenceMapper } from '../mappers/billing-transaction-persistence.mapper';
import { BillingTransactionDocument, BillingTransactionSchemaClass } from '../schemas/billing-transaction.schema';

@Injectable()
export class BillingTransactionRepository implements IBillingTransactionRepository {
    constructor(
        @InjectModel(BillingTransactionSchemaClass.name) private readonly _model: Model<BillingTransactionDocument>,
    ) { }

    async findById(id: string): Promise<BillingTransaction | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return BillingTransactionPersistenceMapper.toDomain(document);
    }

    async findByGatewayOrderId(orderId: string): Promise<BillingTransaction | null> {
        const document = await this._model.findOne({ gatewayOrderId: orderId.trim() }).exec();
        if (!document) return null;
        return BillingTransactionPersistenceMapper.toDomain(document);
    }

    async findByGatewayPaymentId(paymentId: string): Promise<BillingTransaction | null> {
        const document = await this._model.findOne({ gatewayPaymentId: paymentId.trim() }).exec();
        if (!document) return null;
        return BillingTransactionPersistenceMapper.toDomain(document);
    }

    async findByReceiptNumber(receiptNumber: string): Promise<BillingTransaction | null> {
        const document = await this._model.findOne({ receiptNumber: receiptNumber.trim() }).exec();
        if (!document) return null;
        return BillingTransactionPersistenceMapper.toDomain(document);
    }

    async findByUserId(userId: string, pagination?: { page?: number; limit?: number }): Promise<PaginatedBillingTransactionsResult> {
        const page = Math.max(1, pagination?.page ?? BILLING_POLICY.PAGINATION.DEFAULT_PAGE);
        const limit = Math.min(
            BILLING_POLICY.PAGINATION.MAX_LIMIT,
            Math.max(1, pagination?.limit ?? BILLING_POLICY.PAGINATION.DEFAULT_LIMIT),
        );
        const skip = (page - 1) * limit;

        const query = { userId };

        const [documents, total] = await Promise.all([
            this._model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this._model.countDocuments(query).exec(),
        ]);

        return {
            items: BillingTransactionPersistenceMapper.toDomainList(documents),
            total,
        };
    }

    async findAll(filter: BillingHistoryFilter): Promise<PaginatedBillingTransactionsResult> {
        const page = Math.max(1, filter.page ?? BILLING_POLICY.PAGINATION.DEFAULT_PAGE);
        const limit = Math.min(
            BILLING_POLICY.PAGINATION.MAX_LIMIT,
            Math.max(1, filter.limit ?? BILLING_POLICY.PAGINATION.DEFAULT_LIMIT),
        );
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {};

        if (filter.userId) {
            query.userId = filter.userId;
        }

        if (filter.type) {
            query.type = filter.type;
        }

        if (filter.status) {
            query.status = filter.status;
        }

        if (filter.fromDate || filter.toDate) {
            const createdAtFilter: Record<string, Date> = {};
            if (filter.fromDate) {
                createdAtFilter['$gte'] = new Date(filter.fromDate);
            }
            if (filter.toDate) {
                createdAtFilter['$lte'] = new Date(filter.toDate);
            }
            query.createdAt = createdAtFilter;
        }

        const [documents, total] = await Promise.all([
            this._model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this._model.countDocuments(query).exec(),
        ]);

        return {
            items: BillingTransactionPersistenceMapper.toDomainList(documents),
            total,
        };
    }

    async create(transaction: BillingTransaction): Promise<BillingTransaction> {
        const persistenceData = BillingTransactionPersistenceMapper.toPersistence(transaction);
        const created = new this._model(persistenceData);
        const saved = await created.save();
        return BillingTransactionPersistenceMapper.toDomain(saved);
    }

    async update(transaction: BillingTransaction): Promise<BillingTransaction> {
        const persistenceData = BillingTransactionPersistenceMapper.toPersistence(transaction);
        const updated = await this._model
            .findByIdAndUpdate(transaction.id, persistenceData, { returnDocument: 'after' })
            .exec();

        if (!updated) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.TRANSACTION_NOT_FOUND);
        }

        return BillingTransactionPersistenceMapper.toDomain(updated);
    }
}
