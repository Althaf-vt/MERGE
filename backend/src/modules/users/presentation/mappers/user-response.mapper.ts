import { UserAggregate } from "../../domain/entities/user.entity";

// Converts a UserEntity into a safe response object for the client.
export class UserResponseMapper{

    // Maps the UserEntity properties into the response format.
    public static toResponse(entity: UserAggregate){
        return {
            id: entity.id,
            email: entity.email.getValue(),
            isEmailVerified: entity.isEmailVerified,
            kycCompleted: entity.kycCompleted,
            accountStatus: entity.accountStatus,
            onboardingStep: entity.onboardingStep,
            profile: entity.profile ? entity.profile.toJSON() : null,
            kycVerification: entity.kycVerification? {
                verificationStatus: entity.kycVerification.verificationStatus,
                documentType: entity.kycVerification.documentType,
                verifiedDOB: entity.kycVerification.verifiedDOB,
                selfieVerificationStatus: entity.kycVerification.selfieVerificationStatus,
                verificationSubmitted: entity.kycVerification.verificationSubmitted,
                passedPrompts: entity.kycVerification.passedPrompts,
                reviewDecision: entity.kycVerification.reviewDecision,
            } : null,
            createdAt: entity.createdAt
        }
    }
}