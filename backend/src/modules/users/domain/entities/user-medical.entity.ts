import { InfectiousVisibility } from "../enums/profile.enums";

export interface UserMedicalProps {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: { status: string; details?: string };
    genetic?: { status: string; details?: string };
    infectious?: { hiv: string; hepatitis: string };
    infectiousVisibility: InfectiousVisibility;
    disability?: { hasDisability: boolean; details?: string };
    updatedAt?: Date;
}

export class UserMedical {
    private _props: UserMedicalProps;

    constructor(props: UserMedicalProps) {
        this._props = {
            ...props,
            infectiousVisibility: props.infectiousVisibility ?? InfectiousVisibility.HIDDEN,
            updatedAt: props.updatedAt ?? new Date()
        };
    }

    get diabetes(): string | undefined { return this._props.diabetes; }
    get bloodPressure(): string | undefined { return this._props.bloodPressure; }
    get fertility() { return this._props.fertility; }
    get genetic() { return this._props.genetic; }
    get infectious() { return this._props.infectious; }
    get infectiousVisibility(): InfectiousVisibility { return this._props.infectiousVisibility; }
    get disability() { return this._props.disability; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    updateMedicalInfo(payload: Partial<UserMedicalProps>): void {
        if (payload.diabetes !== undefined) this._props.diabetes = payload.diabetes;
        if (payload.bloodPressure !== undefined) this._props.bloodPressure = payload.bloodPressure;
        if (payload.fertility !== undefined) this._props.fertility = payload.fertility;
        if (payload.genetic !== undefined) this._props.genetic = payload.genetic;
        if (payload.infectious !== undefined) this._props.infectious = payload.infectious;
        if (payload.infectiousVisibility !== undefined) this._props.infectiousVisibility = payload.infectiousVisibility;
        if (payload.disability !== undefined) this._props.disability = payload.disability;
        
        this._props.updatedAt = new Date();
    }

    toJSON() {
        return { ...this._props };
    }
}