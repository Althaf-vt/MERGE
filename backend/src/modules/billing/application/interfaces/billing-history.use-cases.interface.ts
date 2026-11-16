import { AdminBillingHistoryQueryDto, BillingHistoryQueryDto, PaginatedBillingHistoryResponseDto } from '../dtos/billing-transaction-response.dto';

export const GET_USER_BILLING_HISTORY_USE_CASE = 'GET_USER_BILLING_HISTORY_USE_CASE';
export const GET_ADMIN_BILLING_HISTORY_USE_CASE = 'GET_ADMIN_BILLING_HISTORY_USE_CASE';

export interface IGetUserBillingHistoryUseCase {
    execute(userId: string, query?: BillingHistoryQueryDto): Promise<PaginatedBillingHistoryResponseDto>;
}

export interface IGetAdminBillingHistoryUseCase {
    execute(query?: AdminBillingHistoryQueryDto): Promise<PaginatedBillingHistoryResponseDto>;
}
