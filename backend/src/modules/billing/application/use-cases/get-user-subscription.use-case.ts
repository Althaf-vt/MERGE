import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';
import { IGetUserSubscriptionUseCase } from '../interfaces/subscription-lifecycle.use-cases.interface';
import { SubscriptionDtoMapper } from '../mappers/subscription-dto.mapper';

@Injectable()
export class GetUserSubscriptionUseCase implements IGetUserSubscriptionUseCase {
    constructor(
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) { }

    async execute(userId: string): Promise<UserSubscriptionResponseDto | null> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        const subscription = await this._userSubscriptionRepository.findByUserId(userId.trim());
        if (!subscription) {
            return null;
        }

        return SubscriptionDtoMapper.toResponseDto(subscription);
    }
}
