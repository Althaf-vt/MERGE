export type InfectiousVisibility = 'MATCH_ONLY' | 'EVERYONE' | 'HIDDEN';
export type PhotoVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ProfileVisibility = 'VISIBLE' | 'PAUSED' | 'HIDDEN';

export interface GetProfileResponse {
    success: boolean;
    data: {
        id: string;
        email: string;
        profile: any;
        photos: Array<{
            id: string;
            url: string; // This will now be the fresh AWS Presigned URL!
            isPrimary: boolean;
            status: string;
            faceMatchScore?: number;
            uploadedAt: string;
        }>;
        privacySettings: any;
        medicalRecord: any;
        kycCompleted: boolean;
        onboardingCompleted: boolean;
    };
}

export interface UserPhoto {
    id: string;
    url: string;
    isPrimary: boolean;
    status: PhotoVerificationStatus;
    faceMatchScore?: number;
    uploadedAt: string;
}

export interface UserMedical {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: string;
    genetic?: string;
    infectious?: string;
    infectiousVisibility: InfectiousVisibility;
    disability?: string;
    updatedAt: string;
}

export interface UserPrivacy {
    showAge: boolean;
    showOccupation: boolean;
    blurPhotos: boolean;
    profileVisibility: ProfileVisibility;
    updatedAt: string;
}

// Request Payloads
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

export interface UpdateMedicalRequest {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: FertilityRecord;
    genetic?: GeneticRecord;
    infectious?: InfectiousRecord;
    infectiousVisibility?: string;
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

export interface ProfileStandardResponse {
    success: boolean;
    message: string;
}

export interface UpdateFullProfileRequest {
    displayName?: string;
    customLabel?: string;
    bio?: string;
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

// --- SECURITY & SESSION TYPES ---

export interface UserSessionData {
    sessionId: string;
    userId: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: string; // ISO Date string
    createdAt: string;  // ISO Date string
}

export interface GetActiveSessionsResponse {
    success: boolean;
    data: UserSessionData[];
}

// Request Payloads
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

export interface GetBlockedUsersResponse {
    success: boolean;
    data: BlockedUser[];
}

export interface BlockUserRequest {
    blockedId: string;
    reason?: string;
}