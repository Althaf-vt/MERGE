import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IUpdatePersonaUseCase, UpdatePersonaResult } from "../interfaces/update-persona.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UpdatePersonaDto } from "../dtos/update-persona.dto";
import { UserProfile } from "../../domain/entities/user-profile.entity";
import { LocationVO } from "../../domain/value-objects/location.vo";
import { UserProfileDtoMapper } from "../mappers/user-profile-dto.mapper";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { USER_POLICY } from "../../domain/constants/user.constants";

@Injectable()
export class UpdatePersonaUseCase implements IUpdatePersonaUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    async execute(userId: string, payload: UpdatePersonaDto): Promise<UpdatePersonaResult> {
        const user = await this._userRepository.findById(userId);

        if(!user){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const profile = user.profile || new UserProfile({});

        const locationVO = new LocationVO(payload.country, payload.state, payload.city);

        profile.updatePersona({
            displayName: payload.displayName,
            phoneNumber: payload.phoneNumber,
            pronouns: payload.pronouns,
            genderIdentity: payload.genderIdentity,
            customLabel: payload.customLabel,
            location: locationVO,
            heightCm: payload.heightCm,
            languages: payload.languages,
            intersex: payload.intersex,
            outnessLevel: payload.outnessLevel,
            relationshipStatus: payload.relationshipStatus,
            relationshipGoal: payload.relationshipGoal,
            maritalStatus: payload.maritalStatus,
            openToAdoption: payload.openToAdoption,
            immigrationReady: payload.immigrationReady
        });

        user.attachProfile(profile);
        user.advanceOnboardingStep(USER_POLICY.ONBOARDING_STEPS.PERSONA_COMPLETED); 

        await this._userRepository.update(user);

        return UserProfileDtoMapper.toPersonaResult(profile, user.kycVerification?.verifiedDOB);
    }
}
