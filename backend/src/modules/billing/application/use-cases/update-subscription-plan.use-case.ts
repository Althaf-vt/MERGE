import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { UpdateSubscriptionPlanDto } from '../dtos/manage-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { IUpdateSubscriptionPlanUseCase } from '../interfaces/subscription-plan.use-cases.interface';
import { SubscriptionPlanDtoMapper } from '../mappers/subscription-plan-dto.mapper';

@Injectable()
export class UpdateSubscriptionPlanUseCase implements IUpdateSubscriptionPlanUseCase {
    constructor(
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) { }

    async execute(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto> {
        if (!id || id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_ID_REQUIRED);
        }

        const plan = await this._subscriptionPlanRepository.findById(id.trim());
        if (!plan) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NOT_FOUND);
        }

        if (dto.offers) {
            SubscriptionPlanDtoMapper.validateOfferDtos(dto.offers, plan.toSnapshot().offers);
        }

        const updateProps = SubscriptionPlanDtoMapper.toUpdateProps(dto, plan.toSnapshot());
        plan.updateDetails(updateProps);

        if (dto.isActive !== undefined) {
            if (dto.isActive) {
                plan.activate();
            } else {
                plan.deactivate();
            }
        }

        const updated = await this._subscriptionPlanRepository.update(plan);
        return SubscriptionPlanDtoMapper.toResponseDto(updated);
    }
}
