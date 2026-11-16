import { Inject, Injectable } from '@nestjs/common';
import { AdminBillingHistoryQueryDto, PaginatedBillingHistoryResponseDto } from '../dtos/billing-transaction-response.dto';
import { CreditPackResponseDto } from '../dtos/credit-pack-response.dto';
import { CreateCreditPackDto, UpdateCreditPackDto } from '../dtos/manage-credit-pack.dto';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '../dtos/manage-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { GET_ADMIN_BILLING_HISTORY_USE_CASE, IGetAdminBillingHistoryUseCase } from '../interfaces/billing-history.use-cases.interface';
import { CREATE_CREDIT_PACK_USE_CASE, GET_CREDIT_PACKS_USE_CASE, ICreateCreditPackUseCase, IGetCreditPacksUseCase, IUpdateCreditPackUseCase, UPDATE_CREDIT_PACK_USE_CASE } from '../interfaces/credit.use-cases.interface';
import { CREATE_SUBSCRIPTION_PLAN_USE_CASE, GET_SUBSCRIPTION_PLANS_USE_CASE, ICreateSubscriptionPlanUseCase, IGetSubscriptionPlansUseCase, IUpdateSubscriptionPlanUseCase, UPDATE_SUBSCRIPTION_PLAN_USE_CASE } from '../interfaces/subscription-plan.use-cases.interface';
import { IBillingAdminFacade } from '../interfaces/billing-facades.interface';

@Injectable()
export class BillingAdminFacade implements IBillingAdminFacade {
    constructor(
        @Inject(GET_ADMIN_BILLING_HISTORY_USE_CASE) private readonly _getAdminBillingHistoryUseCase: IGetAdminBillingHistoryUseCase,
        @Inject(GET_SUBSCRIPTION_PLANS_USE_CASE) private readonly _getSubscriptionPlansUseCase: IGetSubscriptionPlansUseCase,
        @Inject(CREATE_SUBSCRIPTION_PLAN_USE_CASE) private readonly _createSubscriptionPlanUseCase: ICreateSubscriptionPlanUseCase,
        @Inject(UPDATE_SUBSCRIPTION_PLAN_USE_CASE) private readonly _updateSubscriptionPlanUseCase: IUpdateSubscriptionPlanUseCase,
        @Inject(GET_CREDIT_PACKS_USE_CASE) private readonly _getCreditPacksUseCase: IGetCreditPacksUseCase,
        @Inject(CREATE_CREDIT_PACK_USE_CASE) private readonly _createCreditPackUseCase: ICreateCreditPackUseCase,
        @Inject(UPDATE_CREDIT_PACK_USE_CASE) private readonly _updateCreditPackUseCase: IUpdateCreditPackUseCase,
    ) { }

    async getAdminBillingHistory(query?: AdminBillingHistoryQueryDto): Promise<PaginatedBillingHistoryResponseDto> {
        return this._getAdminBillingHistoryUseCase.execute(query);
    }

    async getAllSubscriptionPlans(includeInactive: boolean = true): Promise<SubscriptionPlanResponseDto[]> {
        return this._getSubscriptionPlansUseCase.execute(includeInactive);
    }

    async createSubscriptionPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto> {
        return this._createSubscriptionPlanUseCase.execute(dto);
    }

    async updateSubscriptionPlan(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto> {
        return this._updateSubscriptionPlanUseCase.execute(id, dto);
    }

    async getAllCreditPacks(includeUnlisted: boolean = true): Promise<CreditPackResponseDto[]> {
        return this._getCreditPacksUseCase.execute(includeUnlisted);
    }

    async createCreditPack(dto: CreateCreditPackDto): Promise<CreditPackResponseDto> {
        return this._createCreditPackUseCase.execute(dto);
    }

    async updateCreditPack(id: string, dto: UpdateCreditPackDto): Promise<CreditPackResponseDto> {
        return this._updateCreditPackUseCase.execute(id, dto);
    }
}
