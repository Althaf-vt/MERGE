import { Inject, Injectable } from "@nestjs/common";
import { IPassCandidateUseCase } from "../interfaces/pass-candidate.use-case.interface";
import { DISCOVERY_PASS_REPOSITORY, IDiscoveryPassRepository } from "../../domain/interfaces/discovery-pass-repository.interface";
import { PassCandidateDto } from "../dtos/discovery.dto";
import { DiscoveryPass } from "../../domain/entities/discovery-pass.entity";

@Injectable()
export class PassCandidateUseCase implements IPassCandidateUseCase {
    constructor(
        @Inject(DISCOVERY_PASS_REPOSITORY) private readonly _passRepo: IDiscoveryPassRepository,
    ) {}

    async execute(userId: string, dto: PassCandidateDto): Promise<void> {
        const pass = new DiscoveryPass({
            userId,
            targetUserId: dto.targetUserId,
        });

        await this._passRepo.recordPass(pass);
    }
}