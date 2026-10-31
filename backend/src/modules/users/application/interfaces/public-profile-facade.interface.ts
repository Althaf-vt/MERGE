export const PUBLIC_PROFILE_FACADE = 'PUBLIC_PROFILE_FACADE';

export interface PublicProfileDto {
    id: string;
    displayName: string;
    profilePhotoUrl: string | null;
}

export interface IPublicProfileFacade {
    getPublicProfile(userId: string): Promise<PublicProfileDto | null>;
}