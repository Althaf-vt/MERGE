import { UserKyc } from "../../../domain/entities/kyc-verification.entity";
import { UserAggregate, UserRole, KycStatus } from "../../../domain/entities/user.entity";
import { AuthProvider, UserStatus } from "../../../domain/enums/user.enums";
import { EmailVO } from "../../../domain/value-objects/email.vo";
import { UserDocument } from "../user.schema";

// Maps between domain UserEntity objects and Mongoose persistence documents.
export class UserPersistenceMapper{

    // Converts a MongoDB/Mongoose User document into a domain UserEntity.
    public static toDomain(raw: UserDocument): UserAggregate{

        // Reconstruct the UserKyc entity if the data exists in the database
        let kycEntity: UserKyc | undefined;

        if(raw.kycVerification){
            kycEntity = new UserKyc({
                userId: raw._id.toString(),
                verificationStatus: raw.kycVerification.verificationStatus,
                documentType: raw.kycVerification.documentType,
                issuingCountry: raw.kycVerification.issuingCountry,
                documentFrontS3: raw.kycVerification.documentFrontS3,
                documentBackS3: raw.kycVerification.documentBackS3,
                legalName: raw.kycVerification.legalName,
                verifiedDOB: raw.kycVerification.verifiedDOB,
                hashedDocumentNumber: raw.kycVerification.hashedDocumentNumber,
                ocrConfidence: raw.kycVerification.ocrConfidence
            })
        }

        return new UserAggregate({
            id: raw._id.toString(),
            email: new EmailVO(raw.email),
            passwordHash: raw.passwordHash,
            authProvider: (raw.authProvider as AuthProvider) ?? AuthProvider.EMAIL,
            isEmailVerified: raw.isEmailVerified,
            kycCompleted: raw.kycCompleted,
            accountStatus: (raw.accountStatus as UserStatus) ?? UserStatus.ACTIVE,
            onboardingStep: raw.onboardingStep,
            onboardingCompleted: raw.onboardingCompleted ?? false,
            profileCompleted: raw.profileCompleted ?? false,
            castingDirectorCompleted: raw.castingDirectorCompleted ?? false,
            lumenEnabled: raw.lumenEnabled ?? true,
            dailyMatchHours: raw.dailyMatchHours ?? [],
            lumenRecommendationGeneratedToday: raw.lumenRecommendationGeneratedToday ?? 0,
            lastLumenReset: raw.lastLumenReset ?? new Date(),
            lastLogin: raw.lastLogin,
            kycVerification: kycEntity, //  Attach to the root aggregate
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt']
        });
    }

    // Converts a domain UserEntity into a plain object that can be stored in MongoDB.
    public static toPersistence(entity: UserAggregate): any{
        const data = entity.toJSON();
        return{
            email: data.email,
            passwordHash: data.passwordHash,
            authProvider: data.authProvider,
            isEmailVerified: data.isEmailVerified,
            kycCompleted: data.kycCompleted,
            accountStatus: data.accountStatus,
            onboardingStep: data.onboardingStep,
            onboardingCompleted: data.onboardingCompleted,
            profileCompleted: data.profileCompleted,
            castingDirectorCompleted: data.castingDirectorCompleted,
            lumenEnabled: data.lumenEnabled,
            dailyMatchHours: data.dailyMatchHours,
            lumenRecommendationGeneratedToday: data.lumenRecommendationGeneratedToday,
            lastLumenReset: data.lastLumenReset,
            lastLogin: data.lastLogin,

            // Flatten the KYC entity for MongoDB storage
            kycVerification: data.kycVerification ? {
                verificationStatus: data.kycVerification.verificationStatus,
                documentType: data.kycVerification.documentType,
                issuingCountry: data.kycVerification.issuingCountry,
                documentFrontS3: data.kycVerification.documentFrontS3,
                documentBackS3: data.kycVerification.documentBackS3,
                legalName: data.kycVerification.legalName,
                verifiedDOB: data.kycVerification.hashedDocumentNumber,
                ocrConfidence: data.kycVerification.ocrConfidence,
            }: null,
        }
    }
}