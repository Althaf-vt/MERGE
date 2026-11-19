import { ProfileVisibility } from "../enums/profile.enums";

export interface UserPrivacyProps {
    showAge: boolean;
    showOccupation: boolean;
    blurPhotos: boolean;
    profileVisibility: ProfileVisibility;
    updatedAt?: Date;
}

export interface UpdatePrivacySettingsPayload {
    showAge?: boolean;
    showOccupation?: boolean;
    blurPhotos?: boolean;
    profileVisibility?: ProfileVisibility;
}

export interface UserPrivacySnapshot {
    showAge: boolean;
    showOccupation: boolean;
    blurPhotos: boolean;
    profileVisibility: ProfileVisibility;
    updatedAt?: Date;
    [key: string]: unknown;
}
