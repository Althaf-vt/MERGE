import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BillingTransactionType, Currency, PaymentEnvironment, TransactionStatus } from '../../domain/enums/billing.enums';

export interface BillingTransactionAmountDto {
    amount: number;
    currency: Currency;
    formatted: string;
}

export interface BillingTransactionResponseDto {
    id: string;
    userId: string;
    type: BillingTransactionType;
    status: TransactionStatus;
    amount: BillingTransactionAmountDto | null;
    creditsDelta: number;
    description: string;
    referenceId: string | null;
    gatewayPaymentId: string | null;
    gatewayOrderId: string | null;
    receiptNumber: string | null;
    environment: PaymentEnvironment;
    metadata: Record<string, string | number | boolean> | null;
    createdAt: Date;
}

export interface PaginatedBillingHistoryResponseDto {
    items: BillingTransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
}

export class BillingHistoryQueryDto {
    @IsOptional()
    @IsEnum(BillingTransactionType)
    type?: BillingTransactionType;

    @IsOptional()
    @IsEnum(TransactionStatus)
    status?: TransactionStatus;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}
