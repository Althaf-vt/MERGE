import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { IGetSubscriptionPlanByIdUseCase } from '../interfaces/subscription-plan.use-cases.interface';
import { SubscriptionPlanDtoMapper } from '../mappers/subscription-plan-dto.mapper';

@Injectable()
export class GetSubscriptionPlanByIdUseCase implements IGetSubscriptionPlanByIdUseCase {
    constructor(
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) { }

    async execute(idOrCode: string): Promise<SubscriptionPlanResponseDto> {
        if (!idOrCode || idOrCode.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_ID_REQUIRED);
        }

        const normalized = idOrCode.trim();
        let plan = await this._subscriptionPlanRepository.findById(normalized);

        if (!plan) {
            plan = await this._subscriptionPlanRepository.findByCode(normalized.toUpperCase());
        }

        if (!plan) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NOT_FOUND);
        }

        return SubscriptionPlanDtoMapper.toResponseDto(plan);
    }
}
