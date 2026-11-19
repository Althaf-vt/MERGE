import { UserAggregate } from "../../domain/entities/user.entity";
import { PublicProfileDto, PublicProfileSummaryDto } from "../interfaces/public-profile-facade.interface";
import { PhotoVerificationStatus } from "../../domain/enums/profile.enums";

export class PublicProfileFacadeMapper {
    public static isInteractable(user: UserAggregate): boolean {
        return user.isInteractable();
    }

    public static toSummaryDto(user: UserAggregate): PublicProfileSummaryDto {
        const photos = user.photos || [];
        const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
        const isPhotoVerified = photos.some(p => p.status === PhotoVerificationStatus.APPROVED);

        return {
            id: user.id as string,
            displayName: user.profile?.displayName ?? 'Unknown',
            customLabel: user.profile?.customLabel ?? null,
            profilePhotoUrl: primaryPhoto?.url ?? null,
            age: user.calculateAge(),
            city: user.profile?.city ?? null,
            country: user.profile?.country ?? null,
            isKycVerified: Boolean(user.kycCompleted),
            isPhotoVerified,
            isInteractable: user.isInteractable(),
        };
    }

    public static toSummaryDtoMap(users: UserAggregate[]): Map<string, PublicProfileSummaryDto> {
        const resultMap = new Map<string, PublicProfileSummaryDto>();
        for (const user of users) {
            if (user.id && user.isInteractable()) {
                resultMap.set(user.id, PublicProfileFacadeMapper.toSummaryDto(user));
            }
        }
        return resultMap;
    }

    public static toDto(user: UserAggregate): PublicProfileDto {
        const summary = this.toSummaryDto(user);
        const photos = user.photos || [];

        return {
            ...summary,
            bio: user.profile?.bio ?? null,
            genderIdentity: user.profile?.genderIdentity ?? null,
            pronouns: user.profile?.pronouns ?? null,
            sexualOrientation: user.profile?.sexualOrientation ?? null,
            heightCm: user.profile?.heightCm ?? null,
            languages: user.profile?.languages ?? [],
            education: user.profile?.education ?? [],
            occupation: user.privacySettings?.showOccupation === false ? null : (user.profile?.occupation ?? null),
            interests: user.profile?.interests ?? [],
            selectedTraits: user.profile?.selectedTraits ?? [],
            relationshipGoal: user.profile?.relationshipGoal ?? null,
            diet: user.profile?.diet ?? null,
            smokingHabit: user.profile?.smokingHabit ?? null,
            drinkingHabit: user.profile?.drinkingHabit ?? null,
            photos: photos.map(p => p.url),
        };
    }
}
