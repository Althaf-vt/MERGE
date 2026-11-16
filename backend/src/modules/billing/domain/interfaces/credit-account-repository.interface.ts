import { IBaseRepository } from '../../../../shared/domain/interfaces/base-repository.interface';
import { CreditAccount } from '../entities/credit-account.entity';

export const CREDIT_ACCOUNT_REPOSITORY = 'CREDIT_ACCOUNT_REPOSITORY';

export interface ICreditAccountRepository extends IBaseRepository<CreditAccount> {
    findByUserId(userId: string): Promise<CreditAccount | null>;
    getOrCreate(userId: string): Promise<CreditAccount>;
}
