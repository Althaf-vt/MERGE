import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IUpdatePersonaUseCase } from "../interfaces/update-persona.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UpdatePersonaDto } from "../dtos/update-persona.dto";
import { UserProfile } from "../../domain/entities/user-profile.entity";
import { INDIAN_LOCATION_DATA } from "../../domain/constants/location-data.constant";

@Injectable()
export class UpdatePersonaUseCase implements IUpdatePersonaUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    async execute(userId: string, payload: UpdatePersonaDto): Promise<{ success: boolean; message: string; profile: any; verifiedDOB?: Date; }> {
        const user = await this._userRepository.findById(userId);

        if(!user){
            throw new BadRequestException("User not found.");
        }

        // 1. Initialize profile if it doesnt exist yet, or use the existing sub-entity
        const profile = user.profile || new UserProfile({});

        const validCities = INDIAN_LOCATION_DATA[payload.state];
        if (!validCities) {
        throw new BadRequestException(`Invalid state: ${payload.state}`);
        }
        if (!validCities.includes(payload.city)) {
        throw new BadRequestException(`City '${payload.city}' does not belong to state '${payload.state}'`);
        }

        profile.updatePersona({
            displayName: payload.displayName,
            phoneNumber: payload.phoneNumber,
            pronouns: payload.pronouns,
            genderIdentity: payload.genderIdentity,
            customLabel: payload.customLabel,
            city: payload.city,
            state: payload.state,
            country: payload.country,
            heightCm: payload.heightCm,
            languages: payload.languages,
            intersex: payload.intersex,
            outnessLevel: payload.outnessLevel,
            relationshipStatus: payload.relationshipStatus,
            relationshipGoal: payload.relationshipGoal,
            maritalStatus: payload.maritalStatus,
            openToAdoption: payload.openToAdoption,
            immigrationReady: payload.immigrationReady
        })

        // 3. Attach profile to aggregate and advance onboarding progression
        user.attachProfile(profile);
        user.advanceOnboardingStep(3) 

        await this._userRepository.update(user);

        return {
            success: true,
            message: "Persona details updated successfully.",
            profile: profile.toJSON(),
            verifiedDOB: user.kycVerification?. verifiedDOB
        }

    }
}