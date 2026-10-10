import { AuthProvider, UserStatus } from "../../domain/enums/user.enums";

export interface UserResponseDto {
    id?: string;
    email: string;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    accountStatus: UserStatus;
    kycCompleted: boolean;
    onboardingStep: number;
    onboardingCompleted: boolean;
    profileCompleted: boolean;
    castingDirectorCompleted: boolean;
    lumenEnabled: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    
    // Sub-entities
    profile?: Record<string, unknown> | null; 
    preference?: Record<string, unknown> | null;
    kycVerification?: Record<string, unknown> | null;
    photos?: Record<string, unknown>[];
    privacySettings?: Record<string, unknown> | null;
    medicalRecord?: Record<string, unknown> | null;
}