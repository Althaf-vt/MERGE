import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";

export interface ScenarioSummaryStatsDto {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    averageDurationMinutes: number;
    averageTurnCount: number;
    coachingAdoptionRate: number;
}

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
    summary?: ScenarioSummaryStatsDto | null;
}

export interface PaginatedAdminScenariosResponseDto {
    data: AdminScenarioResponseDto[];
    total: number;
    page: number;
    limit: number;
}
