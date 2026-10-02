import { PhotoVerificationStatus } from "../enums/profile.enums";

export interface UserPhotoProps {
    id: string;
    url: string;
    isPrimary: boolean;
    status: PhotoVerificationStatus;
    faceMatchScore?: number;
    uploadedAt?: Date;
}

export class UserPhoto {
    private _props: UserPhotoProps;

    constructor(props: UserPhotoProps) {
        this._props = {
            ...props,
            isPrimary: props.isPrimary ?? false,
            status: props.status ?? PhotoVerificationStatus.PENDING,
            uploadedAt: props.uploadedAt ?? new Date()
        };
    }

    get id(): string { return this._props.id; }
    get url(): string { return this._props.url; }
    get isPrimary(): boolean { return this._props.isPrimary; }
    get status(): PhotoVerificationStatus { return this._props.status; }
    get faceMatchScore(): number | undefined { return this._props.faceMatchScore; }
    get uploadedAt(): Date { return this._props.uploadedAt as Date; }

    // Domain Behaviors
    markAsPrimary(): void {
        this._props.isPrimary = true;
    }

    removePrimaryStatus(): void {
        this._props.isPrimary = false;
    }

    updateVerificationStatus(status: PhotoVerificationStatus, score?: number): void {
        this._props.status = status;
        if (score !== undefined) {
            this._props.faceMatchScore = score;
        }
    }

    toJSON() {
        return { ...this._props };
    }
}