import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IUpdateLifestyleUseCase } from "../interfaces/update-lifestyle.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UpdateLifestyleDto } from "../dtos/update-lifestyle.dto";
import { UserProfile, UserProfileProps } from "../../domain/entities/user-profile.entity";

@Injectable()
export class UpdateLifeStyleUseCase implements IUpdateLifestyleUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    async execute(userId: string, payload: UpdateLifestyleDto): Promise<UserProfileProps> {
        const user = await this._userRepository.findById(userId);

        if(!user){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "User not found.");
        }

        const profile = user.profile || new UserProfile({});

        profile.updateLifestyle({
            education: payload.education,
            occupation: payload.occupation,
            incomeRange: payload.incomeRange,
            religion: payload.religion,
            disability: payload.disability,
            diet: payload.diet,
            smokingHabit: payload.smokingHabit,
            drinkingHabit: payload.drinkingHabit,
            relationshipStatus: payload.relationshipStatus,
            maritalStatus: payload.maritalStatus
        });

        user.attachProfile(profile);
        user.advanceOnboardingStep(4);

        await this._userRepository.update(user);

        return profile.toJSON();
    }
}