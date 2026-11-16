import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
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

export class AdminBillingHistoryQueryDto extends BillingHistoryQueryDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    fromDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    toDate?: Date;
}
