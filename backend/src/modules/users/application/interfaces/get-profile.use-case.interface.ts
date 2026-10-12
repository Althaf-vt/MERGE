export const GET_PROFILE_USE_CASE = Symbol('GET_PROFILE_USE_CASE');

export interface GetProfileDataResult {
    id: string;
    email: string;
    profile: Record<string, unknown> | null;
    preference: Record<string, unknown> | null;
    photos: Record<string, unknown>[];
    privacySettings: Record<string, unknown> | null;
    medicalRecord: Record<string, unknown> | null;
    kycCompleted: boolean;
    onboardingCompleted: boolean;
}

export interface IGetProfileUseCase {
    execute(userId: string): Promise<GetProfileDataResult>;
}