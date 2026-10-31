export const PUBLIC_PROFILE_FACADE = 'PUBLIC_PROFILE_FACADE';

// Lightweight public profile representation for list previews, candidate cards,
// connection requests, and avatars.
export interface PublicProfileSummaryDto {
    id: string;
    displayName: string;
    customLabel: string | null;
    profilePhotoUrl: string | null;
    age: number | null;
    city: string | null;
    country: string | null;
    isKycVerified: boolean;
    isPhotoVerified: boolean;
    isInteractable: boolean;
}


// Comprehensive public profile representation for detailed modal views,
// candidate inspection, and full profile screens.
export interface PublicProfileDto extends PublicProfileSummaryDto {
    bio: string | null;
    genderIdentity: string | null;
    pronouns: string | null;
    sexualOrientation: string | null;
    heightCm: number | null;
    languages: string[];
    education: string[];
    occupation: string | null;
    interests: string[];
    selectedTraits: string[];
    relationshipGoal: string | null;
    diet: string | null;
    smokingHabit: string | null;
    drinkingHabit: string | null;
    photos: string[];
}

export interface IPublicProfileFacade {

    // Checks if a target profile exists, is ACTIVE, and is eligible for peer interaction.
    // Replaces direct UserStatus/admin moderation checks in peer modules.
    isProfileInteractable(userId: string): Promise<boolean>;

    // Retrieves full public details of a single user.
    // Returns null if the user does not exist, or is inactive/suspended/banned/hidden.
    getPublicProfile(userId: string): Promise<PublicProfileDto | null>;

    // Bulk hydration method to prevent N+1 queries when loading feeds or candidate lists.
    // Returns a Map of user ID to PublicProfileSummaryDto for all interactable users.
    getPublicProfiles(userIds: string[]): Promise<Map<string, PublicProfileSummaryDto>>;
}