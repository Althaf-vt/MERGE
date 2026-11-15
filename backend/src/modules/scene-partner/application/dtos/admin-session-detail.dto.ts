import { ScenarioCategory, SceneSessionStatus, SimulationType } from "../../domain/enums/scene-partner.enums";
import { SceneSessionSummaryResponseDto, SceneTurnResponseDto } from "./scene-session-response.dto";

export interface AdminSessionDetailDto {
    id: string;
    userId: string;
    simulationType: SimulationType;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    scenarioPromptContext: string | null;
    targetUserId: string | null;
    isCoachingEnabled: boolean;
    status: SceneSessionStatus;
    transcript: SceneTurnResponseDto[];
    turnCount: number;
    summary: SceneSessionSummaryResponseDto | null;
    maxDurationMinutes: number;
    pausedAt: Date | null;
    totalPausedMs: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
