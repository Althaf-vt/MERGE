import type { UserPreferenceDetails, UserProfileDetails } from '../../profile/types/profile.types';

export const DocumentType = {
    AADHAAR_XML: 'AADHAAR_XML',
    EPAN_PDF: 'EPAN_PDF',
    DIGILOCKER_DL: 'DIGILOCKER_DL',
    PASSPORT: 'PASSPORT',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export interface SubmitKycPayload {
    documentType: DocumentType;
    issuingCountry: string;
    sharedCode?: string;
}

export interface LivenessResponse {
    livenessScore: number;
    status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
}

export interface UpdatePersonaPayload {
    displayName: string;
    phoneNumber: string;
    pronouns?: string;
    genderIdentity: string;
    customLabel?: string;
    city: string;
    state: string;
    country: string;
    heightCm: number;
    languages: string[];
    intersex?: string;
    outnessLevel: number;
    relationshipStatus?: string;
    relationshipGoal?: string;
    maritalStatus?: string;
    openToAdoption?: string;
    immigrationReady?: string;
}

export interface UpdatePersonaResponseData {
    profile: UserProfileDetails;
    verifiedDOB?: string | Date;
}

export interface UpdateLifestylePayload {
    education: string[];
    occupation: string;
    incomeRange: string[];
    religion: string;
    disability: string;
    diet: string;
    smokingHabit: string;
    drinkingHabit: string;
    relationshipStatus?: string;
    maritalStatus?: string;
}

export interface UpdateLifestyleResponseData {
    profile: UserProfileDetails;
}

export interface UpdatePreferencesPayload {
    preferredGender: string[];
    preferredAgeMin: number;
    preferredAgeMax: number;
    relationshipGoals: string[];
    minimumOutnessLevel: number;
    openToAdoption: boolean | string[];
    immigrationReady: boolean | string[];
    partnerExpectations?: string;
}

export interface UpdatePreferencesResponseData {
    preferences: UserPreferenceDetails;
}

export interface GenerateBioPayload {
    selectedTraits: string[];
    interests: string[];
    additionalNotes?: string;
}

export interface GenerateBioResponseData {
    bios: string[];
    remainingAttempts: number;
}

export interface SaveBioPayload {
    bio: string;
    selectedTraits: string[];
    interests: string[];
}