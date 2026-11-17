import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { CreditPack } from '../../domain/entities/credit-pack.entity';
import { CREDIT_PACK_REPOSITORY, ICreditPackRepository } from '../../domain/interfaces/credit-pack-repository.interface';
import { CreditPackResponseDto } from '../dtos/credit-pack-response.dto';
import { CreateCreditPackDto } from '../dtos/manage-credit-pack.dto';
import { ICreateCreditPackUseCase } from '../interfaces/credit.use-cases.interface';
import { CreditPackDtoMapper } from '../mappers/credit-pack-dto.mapper';
import { SubscriptionPlanDtoMapper } from '../mappers/subscription-plan-dto.mapper';

@Injectable()
export class CreateCreditPackUseCase implements ICreateCreditPackUseCase {
    constructor(
        @Inject(CREDIT_PACK_REPOSITORY) private readonly _creditPackRepository: ICreditPackRepository,
    ) { }

    async execute(dto: CreateCreditPackDto): Promise<CreditPackResponseDto> {
        const existing = await this._creditPackRepository.findByCode(dto.code);
        if (existing) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_CODE_ALREADY_EXISTS);
        }

        if (dto.offers) {
            SubscriptionPlanDtoMapper.validateOfferDtos(dto.offers);
        }

        const createProps = CreditPackDtoMapper.toCreateProps(dto);
        const pack = CreditPack.create(createProps);

        const saved = await this._creditPackRepository.create(pack);
        return CreditPackDtoMapper.toResponseDto(saved);
    }
}
