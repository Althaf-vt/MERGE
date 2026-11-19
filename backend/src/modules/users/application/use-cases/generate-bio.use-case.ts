import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { AI_SERVICE, IAiService } from "../../domain/interfaces/ai-service.interface";
import { GeneratebioResult, IGenerateBioUseCase } from "../interfaces/generate-bio.use-case.interface";
import { GenerateBioDto } from "../dtos/generate-bio.dto";

@Injectable()
export class GenerateBioUseCase implements IGenerateBioUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(AI_SERVICE) private readonly _aiService: IAiService
    ) {}

    async execute(userId: string, payload: GenerateBioDto): Promise<GeneratebioResult> {
        const user = await this._userRepository.findById(userId);

        if (!user || !user.profile) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_OR_PROFILE_NOT_FOUND);
        }

        // 1. Enforce Rate Limiting to prevent API abuse
        if (!user.profile.canGenerateBio()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.MAX_BIO_ATTEMPTS_REACHED);
        }

        // 2. Calculate age safely
        let age: string | undefined;
        if (user.kycVerification?.verifiedDOB) {
            const diff = Date.now() - new Date(user.kycVerification.verifiedDOB).getTime();
            age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
        }

        // 3. Generate Bios
        const generateBios = await this._aiService.generateDatingBios({
            age,
            genderIdentity: user.profile.genderIdentity,
            city: user.profile.city,
            relationshipGoal: user.profile.relationshipGoal,
            selectedTraits: payload.selectedTraits,
            interests: payload.interests,
        });
        
        user.profile.incrementBioAttemps();
        await this._userRepository.update(user);

        return {
            bios: generateBios,
            remainingAttempts: user.profile.remainingBioAttempts
        };
    }
}