import { CreditAccount } from '../../domain/entities/credit-account.entity';
import { CreditBalanceResponseDto } from '../dtos/credit-balance-response.dto';

export class CreditAccountDtoMapper {
    public static toResponseDto(entity: CreditAccount): CreditBalanceResponseDto {
        return {
            id: entity.id,
            userId: entity.userId,
            balance: entity.balance,
            updatedAt: entity.updatedAt,
        };
    }
}
