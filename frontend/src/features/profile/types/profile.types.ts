import type { ApiResponse } from '../../../shared/types/api-response.types';

export type InfectiousVisibility = 'MATCH_ONLY' | 'EVERYONE' | 'HIDDEN';
export type PhotoVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ProfileVisibility = 'VISIBLE' | 'PAUSED' | 'HIDDEN';

export interface UserPhoto {
    id: string;
    url: string;
    isPrimary: boolean;
    status: PhotoVerificationStatus;
    faceMatchScore?: number;
    uploadedAt: string;
}

export interface FertilityRecord {
    status: string;
    details?: string;
}

export interface GeneticRecord {
    status: string;
    details?: string;
}

export interface InfectiousRecord {
    hiv: string;
    hepatitis: string;
}

export interface DisabilityRecord {
    hasDisability: boolean;
    details?: string;
}

export interface UserMedical {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: FertilityRecord | string;
    genetic?: GeneticRecord | string;
    infectious?: InfectiousRecord | string;
    infectiousVisibility: InfectiousVisibility;
    disability?: DisabilityRecord | string;
    updatedAt?: string;
}

export interface UserPrivacy {
    showAge: boolean;
    showOccupation: boolean;
    blurPhotos: boolean;
    profileVisibility: ProfileVisibility;
    outnessLevel?: number;
    updatedAt?: string;
}

export interface UserProfileDetails {
    id?: string;
    displayName?: string;
    customLabel?: string;
    bio?: string;
    bioGenerationAttempts?: number;
    phoneNumber?: string;
    pronouns?: string;
    genderIdentity?: string;
    sexualOrientation?: string;
    intersex?: string;
    outnessLevel?: number;
    city?: string;
    state?: string;
    country?: string;
    heightCm?: number;
    languages?: string[];
    selectedTraits?: string[];
    interests?: string[];
    education?: string[];
    occupation?: string;
    incomeRange?: string[];
    religion?: string;
    disability?: string;
    diet?: string;
    smokingHabit?: string;
    drinkingHabit?: string;
    relationshipGoal?: string;
    relationshipStatus?: string;
    maritalStatus?: string;
    immigrationReady?: string;
    openToAdoption?: string;
    profileCompletion?: number;
    isProfileVisible?: boolean;
}

export interface UserPreferenceDetails {
    preferredGender?: string[];
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    relationshipGoals?: string[];
    minimumOutnessLevel?: number;
    openToAdoption?: boolean;
    immigrationReady?: boolean;
    partnerExpectations?: string;
}

export interface GetProfileData {
    id: string;
    email: string;
    profile: UserProfileDetails | null;
    preference?: UserPreferenceDetails | null;
    photos: UserPhoto[];
    privacySettings: UserPrivacy | null;
    medicalRecord: UserMedical | null;
    kycCompleted: boolean;
    onboardingCompleted: boolean;
}

export type GetProfileResponse = ApiResponse<GetProfileData>;
export type ProfileStandardResponse = ApiResponse<undefined>;

export interface UpdateMedicalRequest {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: FertilityRecord;
    genetic?: GeneticRecord;
    infectious?: InfectiousRecord;
    infectiousVisibility?: InfectiousVisibility | string;
    disability?: DisabilityRecord;
}

export interface UpdatePrivacyRequest {
    showAge?: boolean;
    showOccupation?: boolean;
    blurPhotos?: boolean;
    profileVisibility?: ProfileVisibility;
    outnessLevel?: number;
}

export interface SetPrimaryPhotoRequest {
    photoId: string;
}

export interface UpdateFullProfileRequest {
    displayName?: string;
    customLabel?: string;
    bio?: string;
    phoneNumber?: string;
    pronouns?: string;
    genderIdentity?: string;
    sexualOrientation?: string;
    intersex?: string;
    heightCm?: number;
    languages?: string[];
    religion?: string;
    education?: string[];
    occupation?: string;
    incomeRange?: string[];
    diet?: string;
    smokingHabit?: string;
    drinkingHabit?: string;
    disability?: string;
    relationshipGoal?: string;
    relationshipStatus?: string;
    maritalStatus?: string;
    openToAdoption?: string;
    immigrationReady?: string;
    selectedTraits?: string[];
    interests?: string[];
}

export interface UpdateFullPreferencesRequest {
    preferredGender: string[];
    preferredAgeMin: number;
    preferredAgeMax: number;
    relationshipGoals: string[];
    minimumOutnessLevel: number;
    openToAdoption: boolean | string[];
    immigrationReady: boolean | string[];
    partnerExpectations?: string;
}

// --- SECURITY & SESSION TYPES ---
export interface UserSessionData {
    sessionId: string;
    userId: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: string;
    createdAt: string;
}

export type GetActiveSessionsResponse = ApiResponse<UserSessionData[]>;

export interface UpdateSecurityPasswordRequest {
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

export interface InitiateEmailChangeRequest {
    currentOtp: string;
    newEmail: string;
}

export interface ConfirmEmailChangeRequest {
    newEmailOtp: string;
}

// --- BLOCKED USERS TYPES ---
export interface BlockedUser {
    blockedId: string;
    displayName: string;
    genderIdentity?: string;
    customLabel?: string;
    location?: string;
    avatarUrl: string | null;
    reason: string;
    blockedAt: string;
    isDeleted: boolean;
}

export type GetBlockedUsersResponse = ApiResponse<BlockedUser[]>;

export interface BlockUserRequest {
    blockedId: string;
    reason?: string;
}

export interface GetBlockedUsersQueryParams {
    search?: string;
    sortBy?: 'RECENT' | 'OLDEST';
}