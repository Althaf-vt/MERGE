import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IUpdatePreferencesUseCase } from "../interfaces/update-preferences.use-case.interface";
import { UpdatePreferencesDto } from "../dtos/update-preferences.dto";
import { UserPreference } from "../../domain/entities/user-preference.entity";

@Injectable()
export class UpdatePreferencesUseCase implements IUpdatePreferencesUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    async execute(userId: string, payload: UpdatePreferencesDto): Promise<{ success: boolean; message: string; preferences: any; }> {
        const user = await this._userRepository.findById(userId);

        if(!user){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "User not found.");
        }

        if(payload.preferredAgeMin > payload.preferredAgeMax){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Minimum age cannot exceed maximum age.");
        }

        const preferences = user.preference || new UserPreference({})

        preferences.updatePreferences({
            preferredGender: payload.preferredGender,
            preferredAgeMin: payload.preferredAgeMin,
            preferredAgeMax: payload.preferredAgeMax,
            relationShipGoals: payload.relationshipGoals,
            minimumOutnessLevel: payload.minimumOutnessLevel,
            openToAdoption: payload.openToAdoption,
            immigrationReady: payload.immigrationReady,
            partnerExpectations: payload.partnerExpectations
        })

        user.attatchPreferences(preferences);
        user.advanceOnboardingStep(5);

        await this._userRepository.update(user);

        return {
            success: true,
            message: "Preference updated successfully",
            preferences: preferences.toJSON()
        }
    }
}