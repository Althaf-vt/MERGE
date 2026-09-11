import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { AI_SERVICE, IAiService } from "../../domain/interfaces/ai-service.interface";
import { GeneratebioResult, IGenerateBioUseCase } from "../interfaces/generate-bio.use-case.interface";
import { GenerateBioDto } from "../dtos/generate-bio.dto";

@Injectable()
export class GenerateBioUseCase implements IGenerateBioUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(AI_SERVICE) private readonly _aiService: IAiService
    ){}

    async execute(userId: string, payload: GenerateBioDto): Promise<GeneratebioResult> {
        const user = await this._userRepository.findById(userId);

        if(!user || !user.profile){
            throw new BadRequestException("User or profile not found.");
        }

        // 1. Enforce Rate Limiting to prevent API abuse
        if(!user.profile.canGenerateBio()){
            throw new BadRequestException('Maximum bio generation attemps reached.');
        }

        // 2. Calculate age safely
        let age : string | undefined;
        if(user.kycVerification?.verifiedDOB){
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
        })
        
        user.profile.incrementBioAttemps();
        await this._userRepository.update(user);

        return {
            success: true,
            bios: generateBios,
            remainingAttempts: user.profile.remainingBioAttempts
        }

    }
}