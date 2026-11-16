import { IBaseRepository } from '../../../../shared/domain/interfaces/base-repository.interface';
import { CreditPack } from '../entities/credit-pack.entity';

export const CREDIT_PACK_REPOSITORY = 'CREDIT_PACK_REPOSITORY';

export interface ICreditPackRepository extends IBaseRepository<CreditPack> {
    findByCode(code: string): Promise<CreditPack | null>;
    findListed(): Promise<CreditPack[]>;
    findAll(): Promise<CreditPack[]>;
    count(): Promise<number>;
}
