import { Inject, Injectable } from "@nestjs/common";
import { IPassCandidateUseCase } from "../interfaces/pass-candidate.use-case.interface";
import { DISCOVERY_REPOSITORY, IDiscoveryRepository } from "../../domain/interfaces/discovery-repository.interface";
import { PassCandidateDto } from "../dtos/discovery.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class PassCandidateUseCase implements IPassCandidateUseCase {
    constructor(
        @Inject(DISCOVERY_REPOSITORY) private readonly _discoveryRepo: IDiscoveryRepository,
    ) {}

    async execute(userId: string, dto: PassCandidateDto): Promise<void> {
        const targetUserId = dto.targetUserId?.trim();

        if (!targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Target user ID is required.');
        }

        if (userId === targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Cannot pass on yourself.');
        }

        await this._discoveryRepo.recordPass(userId, targetUserId);
    }
}