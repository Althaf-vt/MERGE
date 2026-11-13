import { ScenarioCategory } from "../../domain/enums/scene-partner.enums";

export interface ScenarioResponseDto {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    creatorUserId?: string | null;
    createdAt?: Date;
}