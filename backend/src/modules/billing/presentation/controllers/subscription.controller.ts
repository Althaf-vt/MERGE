import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/infrastructure/security/guards/jwt-auth.guard';
import { UserSessionGuard } from '../../../../shared/infrastructure/security/guards/user-session.guard';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/security/interfaces/authenticated-request.interface';
import { API_ENDPOINTS } from '../../../../shared/presentation/constants/api-endpoints.constant';
import { RESPONSE_MESSAGES } from '../../../../shared/presentation/constants/response-messages.constant';
import { ApiResponse } from '../../../../shared/presentation/interfaces/api-response.interface';
import { ApiResponseHelper } from '../../../../shared/presentation/utils/api-response.helper';
import { CancelSubscriptionDto } from '../../application/dtos/cancel-subscription.dto';
import { SubscriptionPlanResponseDto } from '../../application/dtos/subscription-plan-response.dto';
import { ToggleAutoRenewDto } from '../../application/dtos/toggle-auto-renew.dto';
import { UserSubscriptionResponseDto } from '../../application/dtos/user-subscription-response.dto';
import { CANCEL_SUBSCRIPTION_USE_CASE, GET_USER_SUBSCRIPTION_USE_CASE, ICancelSubscriptionUseCase, IGetUserSubscriptionUseCase, IToggleAutoRenewalUseCase, TOGGLE_AUTO_RENEWAL_USE_CASE } from '../../application/interfaces/subscription-lifecycle.use-cases.interface';
import { GET_SUBSCRIPTION_PLANS_USE_CASE, IGetSubscriptionPlansUseCase } from '../../application/interfaces/subscription-plan.use-cases.interface';

@Controller(API_ENDPOINTS.BILLING.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class SubscriptionController {
    constructor(
        @Inject(GET_SUBSCRIPTION_PLANS_USE_CASE) private readonly _getSubscriptionPlansUseCase: IGetSubscriptionPlansUseCase,
        @Inject(GET_USER_SUBSCRIPTION_USE_CASE) private readonly _getUserSubscriptionUseCase: IGetUserSubscriptionUseCase,
        @Inject(TOGGLE_AUTO_RENEWAL_USE_CASE) private readonly _toggleAutoRenewalUseCase: IToggleAutoRenewalUseCase,
        @Inject(CANCEL_SUBSCRIPTION_USE_CASE) private readonly _cancelSubscriptionUseCase: ICancelSubscriptionUseCase,
    ) { }

    @Get(API_ENDPOINTS.BILLING.PLANS)
    @HttpCode(HttpStatus.OK)
    async getPlans(): Promise<ApiResponse<SubscriptionPlanResponseDto[]>> {
        const result = await this._getSubscriptionPlansUseCase.execute(false);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.PLANS_FETCHED, result);
    }

    @Get(API_ENDPOINTS.BILLING.SUBSCRIPTION)
    @HttpCode(HttpStatus.OK)
    async getSubscription(
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<UserSubscriptionResponseDto | null>> {
        const result = await this._getUserSubscriptionUseCase.execute(req.user.userId);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.SUBSCRIPTION_FETCHED, result);
    }

    @Patch(API_ENDPOINTS.BILLING.AUTO_RENEW)
    @HttpCode(HttpStatus.OK)
    async toggleAutoRenew(
        @Req() req: AuthenticatedRequest,
        @Body() dto: ToggleAutoRenewDto,
    ): Promise<ApiResponse<UserSubscriptionResponseDto>> {
        const result = await this._toggleAutoRenewalUseCase.execute(req.user.userId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.AUTO_RENEW_UPDATED, result);
    }

    @Post(API_ENDPOINTS.BILLING.CANCEL)
    @HttpCode(HttpStatus.OK)
    async cancelSubscription(
        @Req() req: AuthenticatedRequest,
        @Body() dto: CancelSubscriptionDto,
    ): Promise<ApiResponse<UserSubscriptionResponseDto>> {
        const result = await this._cancelSubscriptionUseCase.execute(req.user.userId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.SUBSCRIPTION_CANCELLED, result);
    }
}
