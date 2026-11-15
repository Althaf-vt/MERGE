import { ScenarioCategory } from "../../domain/enums/scene-partner.enums";

export interface AdminScenarioResponseDto {
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

export interface PaginatedAdminScenariosResponseDto {
    data: AdminScenarioResponseDto[];
    total: number;
    page: number;
    limit: number;
}
