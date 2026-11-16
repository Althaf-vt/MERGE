import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { ToggleAutoRenewDto } from '../dtos/toggle-auto-renew.dto';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';
import { IToggleAutoRenewalUseCase } from '../interfaces/subscription-lifecycle.use-cases.interface';
import { SubscriptionDtoMapper } from '../mappers/subscription-dto.mapper';

@Injectable()
export class ToggleAutoRenewalUseCase implements IToggleAutoRenewalUseCase {
    constructor(
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) { }

    async execute(userId: string, dto: ToggleAutoRenewDto): Promise<UserSubscriptionResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        const subscription = await this._userSubscriptionRepository.findActiveByUserId(userId.trim());
        if (!subscription || !subscription.isActive()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.NO_ACTIVE_SUBSCRIPTION);
        }

        if (dto.autoRenew) {
            subscription.reactivateAutoRenewal();
        } else {
            subscription.cancelAutoRenewal();
        }

        const updated = await this._userSubscriptionRepository.update(subscription);
        return SubscriptionDtoMapper.toResponseDto(updated);
    }
}
