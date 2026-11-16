import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminPermission } from '../../../../shared/domain/enums/admin-rbac.enums';
import { RequirePermissions } from '../../../../shared/infrastructure/security/decorators/require-permissions.decorator';
import { AdminPermissionsGuard } from '../../../../shared/infrastructure/security/guards/admin-permissions.guard';
import { JwtAuthGuard } from '../../../../shared/infrastructure/security/guards/jwt-auth.guard';
import { API_ENDPOINTS } from '../../../../shared/presentation/constants/api-endpoints.constant';
import { RESPONSE_MESSAGES } from '../../../../shared/presentation/constants/response-messages.constant';
import { ApiResponse } from '../../../../shared/presentation/interfaces/api-response.interface';
import { ApiResponseHelper } from '../../../../shared/presentation/utils/api-response.helper';
import { AdminBillingHistoryQueryDto, BillingTransactionResponseDto } from '../../application/dtos/billing-transaction-response.dto';
import { CreditPackResponseDto } from '../../application/dtos/credit-pack-response.dto';
import { CreateCreditPackDto, UpdateCreditPackDto } from '../../application/dtos/manage-credit-pack.dto';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '../../application/dtos/manage-plan.dto';
import { SubscriptionPlanResponseDto } from '../../application/dtos/subscription-plan-response.dto';
import { BILLING_ADMIN_FACADE, IBillingAdminFacade } from '../../application/interfaces/billing-facades.interface';

@Controller(API_ENDPOINTS.ADMIN.BILLING.BASE)
@UseGuards(JwtAuthGuard, AdminPermissionsGuard)
export class AdminBillingController {
    constructor(
        @Inject(BILLING_ADMIN_FACADE) private readonly _billingAdminFacade: IBillingAdminFacade,
    ) { }

    @Get(API_ENDPOINTS.ADMIN.BILLING.PLANS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.BILLING_VIEW)
    async getPlans(): Promise<ApiResponse<SubscriptionPlanResponseDto[]>> {
        const result = await this._billingAdminFacade.getAllSubscriptionPlans(true);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.BILLING.PLANS_FETCHED, result);
    }

    @Post(API_ENDPOINTS.ADMIN.BILLING.PLANS)
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions(AdminPermission.BILLING_EDIT)
    async createPlan(
        @Body() dto: CreateSubscriptionPlanDto,
    ): Promise<ApiResponse<SubscriptionPlanResponseDto>> {
        const result = await this._billingAdminFacade.createSubscriptionPlan(dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.BILLING.PLAN_CREATED, result);
    }

    @Patch(API_ENDPOINTS.ADMIN.BILLING.PLAN_BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.BILLING_EDIT)
    async updatePlan(
        @Param('id') id: string,
        @Body() dto: UpdateSubscriptionPlanDto,
    ): Promise<ApiResponse<SubscriptionPlanResponseDto>> {
        const result = await this._billingAdminFacade.updateSubscriptionPlan(id, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.BILLING.PLAN_UPDATED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.BILLING.CREDIT_PACKS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.BILLING_VIEW)
    async getCreditPacks(): Promise<ApiResponse<CreditPackResponseDto[]>> {
        const result = await this._billingAdminFacade.getAllCreditPacks(true);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.BILLING.CREDIT_PACKS_FETCHED, result);
    }

    @Post(API_ENDPOINTS.ADMIN.BILLING.CREDIT_PACKS)
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions(AdminPermission.BILLING_EDIT)
    async createCreditPack(
        @Body() dto: CreateCreditPackDto,
    ): Promise<ApiResponse<CreditPackResponseDto>> {
        const result = await this._billingAdminFacade.createCreditPack(dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.BILLING.CREDIT_PACK_CREATED, result);
    }

    @Patch(API_ENDPOINTS.ADMIN.BILLING.CREDIT_PACK_BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.BILLING_EDIT)
    async updateCreditPack(
        @Param('id') id: string,
        @Body() dto: UpdateCreditPackDto,
    ): Promise<ApiResponse<CreditPackResponseDto>> {
        const result = await this._billingAdminFacade.updateCreditPack(id, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.BILLING.CREDIT_PACK_UPDATED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.BILLING.TRANSACTIONS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.BILLING_VIEW)
    async getTransactions(
        @Query() query: AdminBillingHistoryQueryDto,
    ): Promise<ApiResponse<BillingTransactionResponseDto[]>> {
        const result = await this._billingAdminFacade.getAdminBillingHistory(query);
        return ApiResponseHelper.success(
            RESPONSE_MESSAGES.ADMIN.BILLING.TRANSACTIONS_FETCHED,
            result.items,
            { total: result.total, page: result.page, limit: result.limit },
        );
    }
}
