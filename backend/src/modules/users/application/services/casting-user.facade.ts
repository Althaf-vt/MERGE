import { Inject, Injectable } from "@nestjs/common";
import { IcastingUserFacade } from "../../../casting-director/application/interfaces/casting-user-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { CastingUserContextDto } from "../../../casting-director/application/dtos/casting-user-context.dto";

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
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        // update the aggregate
        user.completeCastingDirector(personalityVector);
        await this._userRepository.update(user);
    }
}