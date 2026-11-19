import { ProfileVisibility } from "../enums/profile.enums";
import {
    UpdatePrivacySettingsPayload,
    UserPrivacyProps,
    UserPrivacySnapshot,
} from "../interfaces/user-privacy.types";

export class UserPrivacy {
    private _props: UserPrivacyProps;

    constructor(props: UserPrivacyProps) {
        this._props = {
            ...props,
            showAge: props.showAge ?? true,
            showOccupation: props.showOccupation ?? true,
            blurPhotos: props.blurPhotos ?? false,
            profileVisibility: props.profileVisibility ?? ProfileVisibility.VISIBLE,
            updatedAt: props.updatedAt ?? new Date()
        };
    }

    get showAge(): boolean { return this._props.showAge; }
    get showOccupation(): boolean { return this._props.showOccupation; }
    get blurPhotos(): boolean { return this._props.blurPhotos; }
    get profileVisibility(): ProfileVisibility { return this._props.profileVisibility; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    updateSettings(payload: UpdatePrivacySettingsPayload): void {
        if (payload.showAge !== undefined) this._props.showAge = payload.showAge;
        if (payload.showOccupation !== undefined) this._props.showOccupation = payload.showOccupation;
        if (payload.blurPhotos !== undefined) this._props.blurPhotos = payload.blurPhotos;
        if (payload.profileVisibility !== undefined) this._props.profileVisibility = payload.profileVisibility;
        
        this._props.updatedAt = new Date();
    }

    toJSON(): UserPrivacySnapshot {
        return { ...this._props };
    }
}