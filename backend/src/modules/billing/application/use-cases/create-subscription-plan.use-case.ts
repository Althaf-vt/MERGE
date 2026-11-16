import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { SubscriptionPlan } from '../../domain/entities/subscription-plan.entity';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { CreateSubscriptionPlanDto } from '../dtos/manage-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { ICreateSubscriptionPlanUseCase } from '../interfaces/subscription-plan.use-cases.interface';
import { SubscriptionPlanDtoMapper } from '../mappers/subscription-plan-dto.mapper';

@Injectable()
export class CreateSubscriptionPlanUseCase implements ICreateSubscriptionPlanUseCase {
    constructor(
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) { }

    async execute(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto> {
        const existing = await this._subscriptionPlanRepository.findByCode(dto.code);
        if (existing) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_CODE_ALREADY_EXISTS);
        }

        const id = dto.id?.trim() || `plan_${randomUUID()}`;
        const createProps = SubscriptionPlanDtoMapper.toCreateProps(dto, id);
        const plan = SubscriptionPlan.create(createProps);

        const saved = await this._subscriptionPlanRepository.create(plan);
        return SubscriptionPlanDtoMapper.toResponseDto(saved);
    }
}
