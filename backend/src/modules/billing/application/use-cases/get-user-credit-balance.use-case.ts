import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { CREDIT_ACCOUNT_REPOSITORY, ICreditAccountRepository } from '../../domain/interfaces/credit-account-repository.interface';
import { CreditBalanceResponseDto } from '../dtos/credit-balance-response.dto';
import { IGetUserCreditBalanceUseCase } from '../interfaces/credit.use-cases.interface';
import { CreditAccountDtoMapper } from '../mappers/credit-account-dto.mapper';

@Injectable()
export class GetUserCreditBalanceUseCase implements IGetUserCreditBalanceUseCase {
    constructor(
        @Inject(CREDIT_ACCOUNT_REPOSITORY) private readonly _creditAccountRepository: ICreditAccountRepository,
    ) { }

    async execute(userId: string): Promise<CreditBalanceResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        const account = await this._creditAccountRepository.getOrCreate(userId.trim());
        return CreditAccountDtoMapper.toResponseDto(account);
    }
}
