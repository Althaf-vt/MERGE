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

export interface UpdateMedicalInfoPayload {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: { status: string; details?: string };
    genetic?: { status: string; details?: string };
    infectious?: { hiv: string; hepatitis: string };
    infectiousVisibility?: InfectiousVisibility;
    disability?: { hasDisability: boolean; details?: string };
}

export interface UserMedicalSnapshot {
    diabetes?: string;
    bloodPressure?: string;
    fertility?: { status: string; details?: string };
    genetic?: { status: string; details?: string };
    infectious?: { hiv: string; hepatitis: string };
    infectiousVisibility: InfectiousVisibility;
    disability?: { hasDisability: boolean; details?: string };
    updatedAt?: Date;
    [key: string]: unknown;
}
