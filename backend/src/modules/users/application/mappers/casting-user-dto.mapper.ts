import { UserAggregate } from "../../domain/entities/user.entity";
import { CastingUserContextDto } from "../dtos/casting-user-context.dto";

export class CastingUserDtoMapper {
    public static toContextDto(user: UserAggregate): CastingUserContextDto | null {
        if (!user || !user.profile || !user.preference) {
            return null;
        }

        return {
            id: user.id as string,
            displayName: user.profile.displayName || 'User',
            bio: user.profile.bio || '',
            relationshipGoal: (user.preference.relationshipGoals as string) || 'Not specified',
            selectedTraits: user.profile.selectedTraits || [],
            interests: user.profile.interests || [],
            partnerExpectations: user.preference.partnerExpectations,
        };
    }
}
