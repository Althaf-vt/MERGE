import { UserAggregate } from "../../domain/entities/user.entity";
import { UserResponseDto } from "../dtos/user-response.dto";
import { IStorageService } from "../interfaces/storage-service.interface";
import { GetProfileDataResult } from "../interfaces/get-profile.use-case.interface";

export class UserResponseMapper {
    public static toResponse(entity: UserAggregate): UserResponseDto {
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

    public static toResponseList(entities: UserAggregate[]): UserResponseDto[] {
        return entities.map((entity) => UserResponseMapper.toResponse(entity));
    }

    public static async toProfileDataResult(
        entity: UserAggregate,
        storageService: IStorageService,
    ): Promise<GetProfileDataResult> {
        const photosWithSignedUrls = await Promise.all(
            (entity.photos || []).map(async (photo) => {
                const signedUrl = await storageService.getPresignedUrl(photo.url, 900);
                return {
                    ...photo.toJSON(),
                    url: signedUrl,
                };
            }),
        );

        return {
            id: entity.id as string,
            email: entity.email.getValue(),
            profile: entity.profile ? entity.profile.toJSON() : null,
            preference: entity.preference ? entity.preference.toJSON() : null,
            photos: photosWithSignedUrls,
            privacySettings: entity.privacySettings ? entity.privacySettings.toJSON() : null,
            medicalRecord: entity.medicalRecord ? entity.medicalRecord.toJSON() : null,
            kycCompleted: entity.kycCompleted,
            onboardingCompleted: entity.onboardingCompleted,
        };
    }
}
