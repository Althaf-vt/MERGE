import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IUpdatePreferencesUseCase } from "../interfaces/update-preferences.use-case.interface";
import { UpdatePreferencesDto } from "../dtos/update-preferences.dto";
import { UserPreference } from "../../domain/entities/user-preference.entity";
import { UserPreferenceProps } from "../../domain/interfaces/user-preference.types";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { USER_POLICY } from "../../domain/constants/user.constants";

@Injectable()
export class UpdatePreferencesUseCase implements IUpdatePreferencesUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    async execute(userId: string, payload: UpdatePreferencesDto): Promise<UserPreferenceProps> {
        const user = await this._userRepository.findById(userId);

        if(!user){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if(payload.preferredAgeMin > payload.preferredAgeMax){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.AGE_MIN_EXCEEDS_MAX);
        }

        const preferences = user.preference || new UserPreference({});

        preferences.updatePreferences({
            preferredGender: payload.preferredGender,
            preferredAgeMin: payload.preferredAgeMin,
            preferredAgeMax: payload.preferredAgeMax,
            relationshipGoals: payload.relationshipGoals,
            minimumOutnessLevel: payload.minimumOutnessLevel,
            openToAdoption: payload.openToAdoption,
            immigrationReady: payload.immigrationReady,
            partnerExpectations: payload.partnerExpectations
        });

        user.attachPreferences(preferences);
        user.advanceOnboardingStep(USER_POLICY.ONBOARDING_STEPS.PREFERENCES_COMPLETED);

        await this._userRepository.update(user);

        return preferences.toJSON();
    }
}