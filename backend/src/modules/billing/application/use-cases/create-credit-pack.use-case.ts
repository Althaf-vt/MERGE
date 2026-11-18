import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { CreditPack } from '../../domain/entities/credit-pack.entity';
import { CREDIT_PACK_REPOSITORY, ICreditPackRepository } from '../../domain/interfaces/credit-pack-repository.interface';
import { BillingNormalizationUtil } from '../../domain/utils/billing-normalization.util';
import { CreditPackResponseDto } from '../dtos/credit-pack-response.dto';
import { CreateCreditPackDto } from '../dtos/manage-credit-pack.dto';
import { ICreateCreditPackUseCase } from '../interfaces/credit.use-cases.interface';
import { CreditPackDtoMapper } from '../mappers/credit-pack-dto.mapper';

@Injectable()
export class CreateCreditPackUseCase implements ICreateCreditPackUseCase {
    constructor(
        @Inject(CREDIT_PACK_REPOSITORY) private readonly _creditPackRepository: ICreditPackRepository,
    ) { }

    async execute(dto: CreateCreditPackDto): Promise<CreditPackResponseDto> {
        // 1. Enforce catalog-wide normalized name uniqueness
        const normalizedName = BillingNormalizationUtil.normalizeName(dto.name);
        const existingWithName = await this._creditPackRepository.findByNormalizedName(normalizedName);
        if (existingWithName) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_NAME_ALREADY_EXISTS);
        }

        // 2. Validate explicit code or auto-generate unique code slug
        let code: string;
        if (dto.code && dto.code.trim().length > 0) {
            code = dto.code.trim().toUpperCase();
            const existingWithCode = await this._creditPackRepository.findByCode(code);
            if (existingWithCode) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_CODE_ALREADY_EXISTS);
            }
        } else {
            code = await this._generateUniqueCode(dto.name, dto.creditsCount);
        }

        // 3. Map create props and instantiate domain aggregate
        const createProps = CreditPackDtoMapper.toCreateProps(dto, code);
        const pack = CreditPack.create(createProps);

        const saved = await this._creditPackRepository.create(pack);
        return CreditPackDtoMapper.toResponseDto(saved);
    }

    private async _generateUniqueCode(name: string, creditsCount: number): Promise<string> {
        const baseCode = BillingNormalizationUtil.generateCreditPackCode(name, creditsCount);
        let candidate = baseCode;
        let suffix = 2;

        while (await this._creditPackRepository.findByCode(candidate)) {
            candidate = `${baseCode}_${suffix}`;
            suffix++;
        }

        return candidate;
    }
}
