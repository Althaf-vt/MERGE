export interface CastingUserContextDto{
    id: string;
    displayName: string;
    bio: string;
    relationshipGoal: string;
    selectedTraits: string[];
    interests: string[];
    partnerExpectations?: string;
}