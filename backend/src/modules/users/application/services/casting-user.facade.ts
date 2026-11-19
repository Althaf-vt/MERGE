import { Inject, Injectable } from "@nestjs/common";
import { IcastingUserFacade } from "../interfaces/casting-user-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { CastingUserContextDto } from "../dtos/casting-user-context.dto";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";

@Injectable()
export class CastingUserFacade implements IcastingUserFacade{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    async getUserContextForCasting(userId: string): Promise<CastingUserContextDto | null> {
        const user = await this._userRepository.findById(userId);
        if(!user || !user.profile || !user.preference) return null;

        return {
            id: user.id as string,
            displayName: user.profile.displayName || 'User',
            bio: user.profile.bio || '',
            relationshipGoal: (user.preference.relationshipGoals as string) || 'Not specified',
            selectedTraits: user.profile.selectedTraits || [],
            interests: user.profile.interests || [],
            partnerExpectations: user.preference.partnerExpectations,
        }
    }

    async markCastingComplete(userId: string, personalityVector: number[]): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);

        // update the aggregate
        user.completeCastingDirector(personalityVector);
        await this._userRepository.update(user);
    }
}