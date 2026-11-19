import { PublicProfileDto, PublicProfileSummaryDto } from "./public-profile-facade.interface";

export const GET_PUBLIC_PROFILE_USE_CASE = Symbol('GET_PUBLIC_PROFILE_USE_CASE');

export interface IGetPublicProfileUseCase {
    isProfileInteractable(userId: string): Promise<boolean>;
    getPublicProfile(userId: string): Promise<PublicProfileDto | null>;
    getPublicProfiles(userIds: string[]): Promise<Map<string, PublicProfileSummaryDto>>;
}

