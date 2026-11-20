import { Inject, Injectable } from "@nestjs/common";
import { IPassCandidateUseCase } from "../interfaces/pass-candidate.use-case.interface";
import { DISCOVERY_REPOSITORY, IDiscoveryRepository } from "../../domain/interfaces/discovery-repository.interface";
import { PassCandidateDto } from "../dtos/discovery.dto";
import { DiscoveryPass } from "../../domain/entities/discovery-pass.entity";

@Injectable()
export class PassCandidateUseCase implements IPassCandidateUseCase {
    constructor(
        @Inject(DISCOVERY_REPOSITORY) private readonly _discoveryRepo: IDiscoveryRepository,
    ) {}

    async execute(userId: string, dto: PassCandidateDto): Promise<void> {
        const pass = new DiscoveryPass({
            userId,
            targetUserId: dto.targetUserId,
        });

        await this._discoveryRepo.recordPass(pass);
    }
}