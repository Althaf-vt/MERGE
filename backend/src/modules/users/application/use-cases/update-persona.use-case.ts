import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IUpdatePersonaUseCase, UpdatePersonaResult } from "../interfaces/update-persona.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UpdatePersonaDto } from "../dtos/update-persona.dto";
import { UserProfile } from "../../domain/entities/user-profile.entity";
import { LocationVO } from "../../domain/value-objects/location.vo";

@Injectable()
export class UpdatePersonaUseCase implements IUpdatePersonaUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    async execute(userId: string, payload: UpdatePersonaDto): Promise<UpdatePersonaResult> {
        const user = await this._userRepository.findById(userId);

        if(!user){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "User not found.");
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
        user.advanceOnboardingStep(3); 

        await this._userRepository.update(user);

        return {
            profile: profile.toJSON(),
            verifiedDOB: user.kycVerification?.verifiedDOB
        };
    }
}