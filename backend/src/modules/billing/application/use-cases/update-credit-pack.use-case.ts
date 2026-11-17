import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { ICreditPackRepository, CREDIT_PACK_REPOSITORY } from '../../domain/interfaces/credit-pack-repository.interface';
import { BillingNormalizationUtil } from '../../domain/utils/billing-normalization.util';
import { CreditPackResponseDto } from '../dtos/credit-pack-response.dto';
import { UpdateCreditPackDto } from '../dtos/manage-credit-pack.dto';
import { IUpdateCreditPackUseCase } from '../interfaces/credit.use-cases.interface';
import { CreditPackDtoMapper } from '../mappers/credit-pack-dto.mapper';

@Injectable()
export class UpdateCreditPackUseCase implements IUpdateCreditPackUseCase {
    constructor(
        @Inject(CREDIT_PACK_REPOSITORY) private readonly _creditPackRepository: ICreditPackRepository,
    ) { }

    async execute(id: string, dto: UpdateCreditPackDto): Promise<CreditPackResponseDto> {
        if (!id || id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_ID_REQUIRED);
        }

        const pack = await this._creditPackRepository.findById(id.trim());
        if (!pack) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_NOT_FOUND);
        }

        // Validate normalized name uniqueness if name is being changed
        if (dto.name && dto.name.trim().length > 0) {
            const nextNormalizedName = BillingNormalizationUtil.normalizeName(dto.name);
            if (nextNormalizedName !== pack.normalizedName) {
                const existingWithName = await this._creditPackRepository.findByNormalizedName(nextNormalizedName);
                if (existingWithName && existingWithName.id !== pack.id) {
                    throw new DomainException(
                        ErrorCode.VALIDATION_FAILED,
                        BILLING_ERROR_MESSAGES.CREDIT_PACK_NAME_ALREADY_EXISTS,
                    );
                }
            }
        }

        const updateProps = CreditPackDtoMapper.toUpdateProps(dto, pack.toSnapshot());
        pack.updateDetails(updateProps);

        if (dto.isListed !== undefined) {
            if (dto.isListed) {
                pack.list();
            } else {
                pack.unlist();
            }
        }

        if (dto.isActive !== undefined) {
            if (dto.isActive) {
                pack.activate();
            } else {
                pack.deactivate();
            }
        }

        const updated = await this._creditPackRepository.update(pack);
        return CreditPackDtoMapper.toResponseDto(updated);
    }
}
