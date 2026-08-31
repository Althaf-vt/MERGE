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
            kycVerification: entity.kycVerfication? {
                verificationStatus: entity.kycVerfication.verificationStatus,
                documentType: entity.kycVerfication.documentType,
            } : null,
            createdAt: entity.createdAt
        }
    }
}