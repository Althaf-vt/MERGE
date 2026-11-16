import { BillingTransaction } from '../../domain/entities/billing-transaction.entity';
import { BillingTransactionResponseDto, PaginatedBillingHistoryResponseDto } from '../dtos/billing-transaction-response.dto';

export class BillingTransactionDtoMapper {
    public static toResponseDto(entity: BillingTransaction): BillingTransactionResponseDto {
        return {
            id: entity.id,
            userId: entity.userId,
            type: entity.type,
            status: entity.status,
            amount: entity.amount
                ? {
                    amount: entity.amount.amount,
                    currency: entity.amount.currency,
                    formatted: entity.amount.format(),
                }
                : null,
            creditsDelta: entity.creditsDelta,
            description: entity.description,
            referenceId: entity.referenceId,
            gatewayPaymentId: entity.gatewayPaymentId,
            gatewayOrderId: entity.gatewayOrderId,
            receiptNumber: entity.receiptNumber,
            environment: entity.environment,
            metadata: entity.metadata,
            createdAt: entity.createdAt,
        };
    }

    public static toDtoList(entities: BillingTransaction[]): BillingTransactionResponseDto[] {
        return entities.map((entity) => BillingTransactionDtoMapper.toResponseDto(entity));
    }

    public static toPaginatedResponseDto(
        entities: BillingTransaction[],
        total: number,
        page: number = 1,
        limit: number = 20,
    ): PaginatedBillingHistoryResponseDto {
        return {
            items: BillingTransactionDtoMapper.toDtoList(entities),
            total,
            page,
            limit,
        };
    }
}
