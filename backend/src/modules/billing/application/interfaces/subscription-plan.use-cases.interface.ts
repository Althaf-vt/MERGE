import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '../dtos/manage-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';

export const GET_SUBSCRIPTION_PLANS_USE_CASE = 'GET_SUBSCRIPTION_PLANS_USE_CASE';
export const GET_SUBSCRIPTION_PLAN_BY_ID_USE_CASE = 'GET_SUBSCRIPTION_PLAN_BY_ID_USE_CASE';
export const CREATE_SUBSCRIPTION_PLAN_USE_CASE = 'CREATE_SUBSCRIPTION_PLAN_USE_CASE';
export const UPDATE_SUBSCRIPTION_PLAN_USE_CASE = 'UPDATE_SUBSCRIPTION_PLAN_USE_CASE';

export interface IGetSubscriptionPlansUseCase {
    execute(includeInactive?: boolean): Promise<SubscriptionPlanResponseDto[]>;
}

export interface IGetSubscriptionPlanByIdUseCase {
    execute(idOrCode: string): Promise<SubscriptionPlanResponseDto>;
}

export interface ICreateSubscriptionPlanUseCase {
    execute(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto>;
}

export interface IUpdateSubscriptionPlanUseCase {
    execute(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto>;
}
