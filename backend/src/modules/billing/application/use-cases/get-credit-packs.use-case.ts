import { Inject, Injectable } from '@nestjs/common';
import { CREDIT_PACK_REPOSITORY, ICreditPackRepository } from '../../domain/interfaces/credit-pack-repository.interface';
import { CreditPackResponseDto } from '../dtos/credit-pack-response.dto';
import { IGetCreditPacksUseCase } from '../interfaces/credit.use-cases.interface';
import { CreditPackDtoMapper } from '../mappers/credit-pack-dto.mapper';

@Injectable()
export class GetCreditPacksUseCase implements IGetCreditPacksUseCase {
    constructor(
        @Inject(CREDIT_PACK_REPOSITORY) private readonly _creditPackRepository: ICreditPackRepository,
    ) { }

    async execute(includeUnlisted: boolean = false): Promise<CreditPackResponseDto[]> {
        const packs = includeUnlisted
            ? await this._creditPackRepository.findAll()
            : await this._creditPackRepository.findListed();

        return CreditPackDtoMapper.toDtoList(packs);
    }
}
