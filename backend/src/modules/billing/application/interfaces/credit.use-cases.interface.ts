import { CreditBalanceResponseDto } from '../dtos/credit-balance-response.dto';
import { CreditPackResponseDto } from '../dtos/credit-pack-response.dto';
import { CreateCreditPackDto, UpdateCreditPackDto } from '../dtos/manage-credit-pack.dto';

export const GET_CREDIT_PACKS_USE_CASE = 'GET_CREDIT_PACKS_USE_CASE';
export const GET_USER_CREDIT_BALANCE_USE_CASE = 'GET_USER_CREDIT_BALANCE_USE_CASE';
export const DEDUCT_PRIORITY_CREDIT_USE_CASE = 'DEDUCT_PRIORITY_CREDIT_USE_CASE';
export const CREATE_CREDIT_PACK_USE_CASE = 'CREATE_CREDIT_PACK_USE_CASE';
export const UPDATE_CREDIT_PACK_USE_CASE = 'UPDATE_CREDIT_PACK_USE_CASE';

export interface IGetCreditPacksUseCase {
    execute(includeUnlisted?: boolean): Promise<CreditPackResponseDto[]>;
}

export interface IGetUserCreditBalanceUseCase {
    execute(userId: string): Promise<CreditBalanceResponseDto>;
}

export interface IDeductPriorityCreditUseCase {
    execute(userId: string, reason?: string, referenceId?: string): Promise<CreditBalanceResponseDto>;
}

export interface ICreateCreditPackUseCase {
    execute(dto: CreateCreditPackDto): Promise<CreditPackResponseDto>;
}

export interface IUpdateCreditPackUseCase {
    execute(id: string, dto: UpdateCreditPackDto): Promise<CreditPackResponseDto>;
}
