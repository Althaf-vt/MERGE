import { Controller, Get, HttpCode, HttpStatus, Inject, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/infrastructure/security/guards/jwt-auth.guard';
import { UserSessionGuard } from '../../../../shared/infrastructure/security/guards/user-session.guard';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/security/interfaces/authenticated-request.interface';
import { API_ENDPOINTS } from '../../../../shared/presentation/constants/api-endpoints.constant';
import { RESPONSE_MESSAGES } from '../../../../shared/presentation/constants/response-messages.constant';
import { ApiResponse } from '../../../../shared/presentation/interfaces/api-response.interface';
import { ApiResponseHelper } from '../../../../shared/presentation/utils/api-response.helper';
import { BillingHistoryQueryDto, BillingTransactionResponseDto } from '../../application/dtos/billing-transaction-response.dto';
import { CreditBalanceResponseDto } from '../../application/dtos/credit-balance-response.dto';
import { CreditPackResponseDto } from '../../application/dtos/credit-pack-response.dto';
import { GET_USER_BILLING_HISTORY_USE_CASE, IGetUserBillingHistoryUseCase } from '../../application/interfaces/billing-history.use-cases.interface';
import { GET_CREDIT_PACKS_USE_CASE, GET_USER_CREDIT_BALANCE_USE_CASE, IGetCreditPacksUseCase, IGetUserCreditBalanceUseCase } from '../../application/interfaces/credit.use-cases.interface';

@Controller(API_ENDPOINTS.BILLING.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class CreditController {
    constructor(
        @Inject(GET_CREDIT_PACKS_USE_CASE) private readonly _getCreditPacksUseCase: IGetCreditPacksUseCase,
        @Inject(GET_USER_CREDIT_BALANCE_USE_CASE) private readonly _getUserCreditBalanceUseCase: IGetUserCreditBalanceUseCase,
        @Inject(GET_USER_BILLING_HISTORY_USE_CASE) private readonly _getUserBillingHistoryUseCase: IGetUserBillingHistoryUseCase,
    ) { }

    @Get(API_ENDPOINTS.BILLING.CREDITS_PACKS)
    @HttpCode(HttpStatus.OK)
    async getCreditPacks(): Promise<ApiResponse<CreditPackResponseDto[]>> {
        const result = await this._getCreditPacksUseCase.execute(false);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.CREDIT_PACKS_FETCHED, result);
    }

    @Get(API_ENDPOINTS.BILLING.CREDITS_BALANCE)
    @HttpCode(HttpStatus.OK)
    async getUserCreditBalance(
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<CreditBalanceResponseDto>> {
        const result = await this._getUserCreditBalanceUseCase.execute(req.user.userId);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.CREDIT_BALANCE_FETCHED, result);
    }

    @Get(API_ENDPOINTS.BILLING.HISTORY)
    @HttpCode(HttpStatus.OK)
    async getBillingHistory(
        @Req() req: AuthenticatedRequest,
        @Query() query: BillingHistoryQueryDto,
    ): Promise<ApiResponse<BillingTransactionResponseDto[]>> {
        const result = await this._getUserBillingHistoryUseCase.execute(req.user.userId, query);
        return ApiResponseHelper.success(
            RESPONSE_MESSAGES.BILLING.BILLING_HISTORY_FETCHED,
            result.items,
            { total: result.total, page: result.page, limit: result.limit },
        );
    }
}
