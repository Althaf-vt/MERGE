import { CreditAccount } from '../../../domain/entities/credit-account.entity';
import { CreditAccountDocument } from '../schemas/credit-account.schema';

export class CreditAccountPersistenceMapper {
    public static toDomain(raw: CreditAccountDocument): CreditAccount {
        return new CreditAccount({
            id: raw._id ? raw._id.toString() : '',
            userId: raw.userId,
            balance: raw.balance ?? 0,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    public static toPersistence(entity: CreditAccount): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            _id: data.id,
            userId: data.userId,
            balance: data.balance,
        };
    }
}
