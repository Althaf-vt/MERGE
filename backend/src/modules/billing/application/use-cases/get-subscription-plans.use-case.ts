import { Inject, Injectable } from '@nestjs/common';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { IGetSubscriptionPlansUseCase } from '../interfaces/subscription-plan.use-cases.interface';
import { SubscriptionPlanDtoMapper } from '../mappers/subscription-plan-dto.mapper';

@Injectable()
export class GetSubscriptionPlansUseCase implements IGetSubscriptionPlansUseCase {
    constructor(
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) { }

    async execute(includeInactive: boolean = false): Promise<SubscriptionPlanResponseDto[]> {
        const plans = includeInactive
            ? await this._subscriptionPlanRepository.findAll()
            : await this._subscriptionPlanRepository.findActive();

        return SubscriptionPlanDtoMapper.toDtoList(plans);
    }
}
