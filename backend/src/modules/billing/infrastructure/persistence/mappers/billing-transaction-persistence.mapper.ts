import { BillingTransactionType, PaymentEnvironment, TransactionStatus } from '../../../domain/enums/billing.enums';
import { BillingTransaction } from '../../../domain/entities/billing-transaction.entity';
import { BillingTransactionDocument } from '../schemas/billing-transaction.schema';

export class BillingTransactionPersistenceMapper {
    public static toDomain(raw: BillingTransactionDocument): BillingTransaction {
        return new BillingTransaction({
            id: raw._id ? raw._id.toString() : '',
            userId: raw.userId,
            type: raw.type as BillingTransactionType,
            status: raw.status as TransactionStatus,
            amount: raw.amount
                ? {
                    amount: raw.amount.amount,
                    currency: raw.amount.currency,
                }
                : null,
            creditsDelta: raw.creditsDelta ?? 0,
            description: raw.description,
            referenceId: raw.referenceId ?? null,
            gatewayPaymentId: raw.gatewayPaymentId ?? null,
            gatewayOrderId: raw.gatewayOrderId ?? null,
            receiptNumber: raw.receiptNumber ?? null,
            environment: (raw.environment as PaymentEnvironment) ?? PaymentEnvironment.TEST,
            metadata: raw.metadata ?? null,
            createdAt: raw['createdAt'],
        });
    }

    public static toDomainList(rawList: BillingTransactionDocument[]): BillingTransaction[] {
        return rawList.map((raw) => this.toDomain(raw));
    }

    public static toPersistence(entity: BillingTransaction): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            _id: data.id,
            userId: data.userId,
            type: data.type,
            status: data.status,
            amount: data.amount
                ? {
                    amount: data.amount.amount,
                    currency: data.amount.currency,
                }
                : null,
            creditsDelta: data.creditsDelta,
            description: data.description,
            referenceId: data.referenceId ?? null,
            gatewayPaymentId: data.gatewayPaymentId ?? null,
            gatewayOrderId: data.gatewayOrderId ?? null,
            receiptNumber: data.receiptNumber ?? null,
            environment: data.environment,
            metadata: data.metadata ?? null,
            createdAt: data.createdAt,
        };
    }
}
