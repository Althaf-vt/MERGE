import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";

export interface CreatePredefinedScenarioProps {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isActive?: boolean;
}

export interface CreateCustomScenarioProps {
    id: string;
    title: string;
    description: string;
    promptContext: string;
    creatorUserId: string;
}

export interface UpdateScenarioDetailsProps {
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
}

export interface ScenarioProps {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    isActive?: boolean;
    creatorUserId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ScenarioData {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    isActive: boolean;
    creatorUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ScenarioSnapshot {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    isActive: boolean;
    creatorUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
