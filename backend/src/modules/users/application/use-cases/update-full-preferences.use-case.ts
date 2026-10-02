import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { UserPreference } from "../../domain/entities/user-preference.entity";
import { UpdateFullPreferencesDto } from "../dtos/update-full-preferences.dto";
import { IUpdateFullPreferencesUseCase } from "../interfaces/update-full-preferences.use-case.interface";

@Injectable()
export class UpdateFullPreferencesUseCase implements IUpdateFullPreferencesUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string, dto: UpdateFullPreferencesDto): Promise<void> {
        if (dto.preferredAgeMin > dto.preferredAgeMax) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Minimum age cannot be greater than maximum age.');
        }

        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        const preferences = user.preference || new UserPreference({ userId });

        preferences.updatePreferences({
            preferredGender: dto.preferredGender,
            preferredAgeMin: dto.preferredAgeMin,
            preferredAgeMax: dto.preferredAgeMax,
            relationShipGoals: dto.relationshipGoals,
            openToAdoption: dto.openToAdoption,
            diabeteBpPreference: dto.diabeteBpPreference,
            fertilityPreference: dto.fertilityPreference,
            geneticPreference: dto.geneticPreference,
            infectiousPreference: dto.infectiousPreference,
            disablilityPreferece: dto.disablilityPreferece,
            partnerExpectations: dto.partnerExpectations?.trim() || undefined,
        });

        user.attatchPreferences(preferences);
        await this._userRepository.update(user);
    }
}