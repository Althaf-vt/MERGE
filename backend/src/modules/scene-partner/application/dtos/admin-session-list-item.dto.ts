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
