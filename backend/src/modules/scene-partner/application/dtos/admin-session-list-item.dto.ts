import { ScenarioCategory, SceneSessionStatus, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";

export interface AdminSessionListItemDto {
    id: string;
    userId: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    simulationType: SimulationType;
    status: SceneSessionStatus;
    turnCount: number;
    durationMinutes: number;
    // Transitional compatibility for facade in Batch 15.2 (removed in Batch 15.3)
    communicationScore?: number | null;
    isCoachingEnabled: boolean;
    createdAt: Date;
    completedAt?: Date | null;
}

export interface PaginatedAdminSessionsResponseDto {
    data: AdminSessionListItemDto[];
    total: number;
    page: number;
    limit: number;
}
