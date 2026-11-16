import { IBaseRepository } from '../../../../shared/domain/interfaces/base-repository.interface';
import { BillingTransaction } from '../entities/billing-transaction.entity';
import { BillingTransactionType, TransactionStatus } from '../enums/billing.enums';

export const BILLING_TRANSACTION_REPOSITORY = 'BILLING_TRANSACTION_REPOSITORY';

export interface BillingHistoryFilter {
    userId?: string;
    type?: BillingTransactionType;
    status?: TransactionStatus;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
}

export interface PaginatedBillingTransactionsResult {
    items: BillingTransaction[];
    total: number;
}

export interface IBillingTransactionRepository extends IBaseRepository<BillingTransaction> {
    findByGatewayOrderId(orderId: string): Promise<BillingTransaction | null>;
    findByGatewayPaymentId(paymentId: string): Promise<BillingTransaction | null>;
    findByReceiptNumber(receiptNumber: string): Promise<BillingTransaction | null>;
    findByUserId(
        userId: string,
        pagination?: { page?: number; limit?: number },
    ): Promise<PaginatedBillingTransactionsResult>;
    findAll(filter: BillingHistoryFilter): Promise<PaginatedBillingTransactionsResult>;
}
