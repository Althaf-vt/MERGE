import { AuthProvider, UserStatus } from "../enums/user.enums";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { UserProfile } from "../entities/user-profile.entity";
import { UserPreference } from "../entities/user-preference.entity";
import { UserKyc } from "../entities/kyc-verification.entity";
import { UserMedical } from "../entities/user-medical.entity";
import { UserPrivacy } from "../entities/user-privacy.entity";
import { UserPhoto } from "../entities/user-photo.entity";
import { UserProfileSnapshot } from "./user-profile.types";
import { UserKycSnapshot } from "./kyc-verification.types";

export interface UserAggregateProps {
    id?: string;
    email: EmailVO;
    passwordHash?: string | null;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    accountStatus: UserStatus;
    kycCompleted: boolean;
    onboardingStep: number;
    onboardingCompleted: boolean;
    profileCompleted: boolean;
    castingDirectorCompleted: boolean;
    personalityVector?: number[];

    // Moderation state
    statusReason?: string | null;
    statusChangedAt?: Date | null;
    suspendedUntil?: Date | null;

    // Lumen
    lumenEnabled: boolean;
    dailyMatchHours: number[];
    lumenRecommendationGeneratedToday: number;
    lastLumenReset: Date;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    // Sub-Entities (The separate collections)
    profile?: UserProfile;
    preferences?: UserPreference;
    kycVerification?: UserKyc;
    medicalRecord?: UserMedical;
    privacySettings?: UserPrivacy;
    photos?: UserPhoto[];
}

export interface UserSnapshot {
    id?: string;
    email: string;
    passwordHash?: string | null;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    accountStatus: UserStatus;
    kycCompleted: boolean;
    onboardingStep: number;
    onboardingCompleted: boolean;
    profileCompleted: boolean;
    castingDirectorCompleted: boolean;
    personalityVector?: number[];
    statusReason?: string | null;
    statusChangedAt?: Date | null;
    suspendedUntil?: Date | null;
    lumenEnabled: boolean;
    dailyMatchHours: number[];
    lumenRecommendationGeneratedToday: number;
    lastLumenReset: Date;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    profile?: UserProfileSnapshot;
    preference?: Record<string, unknown>;
    kycVerification?: UserKycSnapshot;
    medicalRecord?: Record<string, unknown>;
    privacySettings?: Record<string, unknown>;
    photos?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}
