import { profile } from "console";
import { UserKyc } from "../../../domain/entities/kyc-verification.entity";
import { UserProfile } from "../../../domain/entities/user-profile.entity";
import { UserAggregate, UserRole } from "../../../domain/entities/user.entity";
import { AuthProvider, SelfieVerificationStatus, UserStatus } from "../../../domain/enums/user.enums";
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
                legalName: raw.kycVerification.legalName,
                verifiedDOB: raw.kycVerification.verifiedDOB,
                hashedDocumentNumber: raw.kycVerification.hashedDocumentNumber,

                // Selfie Identity Baseline
                liveSelfieS3: raw.kycVerification.liveSelfieS3,
                selfieFaceEmbedding: raw.kycVerification.selfieFaceEmbedding,
                selfieConfidence: raw.kycVerification.selfieConfidence,
                selfieVerificationStatus: raw.kycVerification.selfieVerificationStatus as SelfieVerificationStatus,

                livenessResults: raw.kycVerification.livenessResults,
                verificationSubmitted: raw.kycVerification.verificationSubmitted,

                // Liveness & Review
                manualReviewRequired: raw.kycVerification.manualReviewRequired,
                adminReviewedBy: raw.kycVerification.adminReviewedBy,
                rejectionReason: raw.kycVerification.rejectionReason,
                submittedAt: raw.kycVerification.submittedAt,
                approvedAt: raw.kycVerification.approvedAt,
                rejectedAt: raw.kycVerification.rejectedAt,
            })
        }

        // Reconstruct the UserProfile entity if profile data exists
        let profileEntity: UserProfile | undefined;

        if(raw.profile){
            profileEntity = new UserProfile({
                displayName: raw.profile.displayName,
                customLabel: raw.profile.customLabel,
                bio: raw.profile.bio,
                phoneNumber: raw.profile.phoneNumber,
                pronouns: raw.profile.pronouns,
                genderIdentity: raw.profile.genderIdentity,
                sexualOrientation: raw.profile.sexualOrientation,
                intersex: raw.profile.intersex,
                outnessLevel: raw.profile.outnessLevel,
                city: raw.profile.city,
                state: raw.profile.state,
                country: raw.profile.country,
                heightCm: raw.profile.heightCm,
                languages: raw.profile.languages,
                selectedTraits: raw.profile.selectedTraits,
                interests: raw.profile.interests,
                education: raw.profile.education,
                occupation: raw.profile.occupation,
                incomeRange: raw.profile.incomeRange,
                religion: raw.profile.religion,
                disability: raw.profile.disability,
                diet: raw.profile.diet,
                smokingHabit: raw.profile.smokingHabit,
                drinkingHabit: raw.profile.drinkingHabit,
                relationshipGoal: raw.profile.relationshipGoal,
                relationshipStatus: raw.profile.relationshipStatus,
                maritalStatus: raw.profile.maritalStatus,
                immigrationReady: raw.profile.immigrationReady,
                openToAdoption: raw.profile.openToAdoption,
                profileCompletion: raw.profile.profileCompletion,
                isProfileVisible: raw.profile.isProfileVisible,
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
            profile: profileEntity,
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

            // Flatten profile for persistance
            profile: data.profile? {
                displayName: data.profile.displayName,
                customLabel: data.profile.customLabel,
                bio: data.profile.bio,
                phoneNumber: data.profile.phoneNumber,
                pronouns: data.profile.pronouns,
                genderIdentity: data.profile.genderIdentity,
                sexualOrientation: data.profile.sexualOrientation,
                intersex: data.profile.intersex,
                outnessLevel: data.profile.outnessLevel,
                city: data.profile.city,
                state: data.profile.state,
                country: data.profile.country,
                heightCm: data.profile.heightCm,
                languages: data.profile.languages,
                selectedTraits: data.profile.selectedTraits,
                interests: data.profile.interests,
                education: data.profile.education,
                occupation: data.profile.occupation,
                incomeRange: data.profile.incomeRange,
                religion: data.profile.religion,
                disability: data.profile.disability,
                diet: data.profile.diet,
                smokingHabit: data.profile.smokingHabit,
                drinkingHabit: data.profile.drinkingHabit,
                relationshipGoal: data.profile.relationshipGoal,
                relationshipStatus: data.profile.relationshipStatus,
                maritalStatus: data.profile.maritalStatus,
                immigrationReady: data.profile.immigrationReady,
                openToAdoption: data.profile.openToAdoption,
                profileCompletion: data.profile.profileCompletion,
                isProfileVisible: data.profile.isProfileVisible,
            }: null,

            // Flatten the KYC entity for MongoDB storage
            kycVerification: data.kycVerification ? {
                verificationStatus: data.kycVerification.verificationStatus,
                documentType: data.kycVerification.documentType,
                issuingCountry: data.kycVerification.issuingCountry,
                legalName: data.kycVerification.legalName,
                verifiedDOB: data.kycVerification.verifiedDOB,
                hashedDocumentNumber: data.kycVerification.hashedDocumentNumber,

                // Selfie Identity Baseline
                liveSelfieS3: data.kycVerification.liveSelfieS3,
                selfieFaceEmbedding: data.kycVerification.selfieFaceEmbedding,
                selfieConfidence: data.kycVerification.selfieConfidence,
                selfieVerificationStatus: data.kycVerification.selfieVerificationStatus,

                livenessResults: data.kycVerification.livenessResults,
                verificationSubmitted: data.kycVerification.verificationSubmitted,

                // Liveness & Review
                manualReviewRequired: data.kycVerification.manualReviewRequired,
                adminReviewedBy: data.kycVerification.adminReviewedBy,
                rejectionReason: data.kycVerification.rejectionReason,
                submittedAt: data.kycVerification.submittedAt,
                approvedAt: data.kycVerification.approvedAt,
                rejectedAt: data.kycVerification.rejectedAt,
            }: null,
        }
    }
}