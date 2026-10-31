import { UserAggregate } from "../../domain/entities/user.entity";
import { PublicProfileDto, PublicProfileSummaryDto } from "../interfaces/public-profile-facade.interface";
import { UserStatus } from "../../domain/enums/user.enums";
import { PhotoVerificationStatus, ProfileVisibility } from "../../domain/enums/profile.enums";

export class PublicProfileFacadeMapper {
    public static isInteractable(user: UserAggregate): boolean {
        const isActive = user.accountStatus === UserStatus.ACTIVE;
        const isNotHidden = user.privacySettings?.profileVisibility !== ProfileVisibility.HIDDEN;
        const isProfileVisible = user.profile?.isProfileVisible !== false;
        return isActive && isNotHidden && isProfileVisible;
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
            age: this.calculateAge(user),
            city: user.profile?.city ?? null,
            country: user.profile?.country ?? null,
            isKycVerified: Boolean(user.kycCompleted),
            isPhotoVerified,
            isInteractable: this.isInteractable(user),
        };
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

    private static calculateAge(user: UserAggregate): number | null {
        if (user.privacySettings?.showAge === false) return null;
        const dob = user.kycVerification?.verifiedDOB;
        if (!dob) return null;

        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    }
}
