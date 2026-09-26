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
export interface UpdateMedicalRequest {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: string;
    genetic?: string;
    infectious?: string;
    infectiousVisibility?: InfectiousVisibility;
    disability?: string;
}

export interface UpdatePrivacyRequest {
    showAge?: boolean;
    showOccupation?: boolean;
    blurPhotos?: boolean;
    profileVisibility?: ProfileVisibility;
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