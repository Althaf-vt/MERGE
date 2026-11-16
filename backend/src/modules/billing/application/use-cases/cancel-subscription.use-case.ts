import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { CancelSubscriptionDto } from '../dtos/cancel-subscription.dto';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';
import { ICancelSubscriptionUseCase } from '../interfaces/subscription-lifecycle.use-cases.interface';
import { SubscriptionDtoMapper } from '../mappers/subscription-dto.mapper';

@Injectable()
export class CancelSubscriptionUseCase implements ICancelSubscriptionUseCase {
    constructor(
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) { }

    async execute(userId: string, dto?: CancelSubscriptionDto): Promise<UserSubscriptionResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        const subscription = await this._userSubscriptionRepository.findActiveByUserId(userId.trim());
        if (!subscription || !subscription.isActive()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.NO_ACTIVE_SUBSCRIPTION);
        }

        subscription.cancelAutoRenewal(dto?.reason);

        const updated = await this._userSubscriptionRepository.update(subscription);
        return SubscriptionDtoMapper.toResponseDto(updated);
    }
}
