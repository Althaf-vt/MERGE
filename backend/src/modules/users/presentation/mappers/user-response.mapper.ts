import { UserAggregate } from "../../domain/entities/user.entity";
import { UserResponseDto } from "../../application/dtos/user-response.dto";

export class UserResponseMapper {
    public static toResponse(
        entity: UserAggregate, 
        presignedPhotoUrls?: Record<string, string>, 
        presignedLiveSelfieUrl?: string | null
    ): UserResponseDto {
        return {
            id: entity.id,
            email: entity.email.getValue(),
            authProvider: entity.authProvider,
            isEmailVerified: entity.isEmailVerified,
            kycCompleted: entity.kycCompleted,
            accountStatus: entity.accountStatus,
            onboardingStep: entity.onboardingStep,

            onboardingCompleted: entity.onboardingCompleted,
            profileCompleted: entity.profileCompleted,
            lumenEnabled: entity.lumenEnabled,

            castingDirectorCompleted: entity.castingDirectorCompleted,
            
            profile: entity.profile ? entity.profile.toJSON() : null,
            preference: entity.preference ? entity.preference.toJSON() : null,
            
            kycVerification: entity.kycVerification ? {
                verificationStatus: entity.kycVerification.verificationStatus,
                documentType: entity.kycVerification.documentType,
                verifiedDOB: entity.kycVerification.verifiedDOB,
                selfieVerificationStatus: entity.kycVerification.selfieVerificationStatus,
                verificationSubmitted: entity.kycVerification.verificationSubmitted,
                passedPrompts: entity.kycVerification.passedPrompts,
                reviewDecision: entity.kycVerification.reviewDecision,
            } : null,

            photos: (entity.photos || []).map(p => p.toJSON()),
            privacySettings: entity.privacySettings ? entity.privacySettings.toJSON() : null,
            medicalRecord: entity.medicalRecord ? entity.medicalRecord.toJSON() : null,
            
            createdAt: entity.createdAt
        };
    }
}