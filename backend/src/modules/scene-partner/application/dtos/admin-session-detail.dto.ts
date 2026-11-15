import {ScenarioCategory,SceneSessionStatus,SessionTimelineEventType,SimulationType} from "../../../../shared/domain/enums/scene-partner.enums";
import { SceneSessionSummaryResponseDto, SceneTurnResponseDto } from "./scene-session-response.dto";

export interface SessionTimelineEventDto {
    id: string;
    eventType: SessionTimelineEventType;
    timestamp: Date;
    metadata?: Record<string, unknown> | null;
}

export interface SessionTelemetryDto {
    durationMinutes: number;
    turnCount: number;
    coachingInterventionCount: number;
    isCoachingEnabled: boolean;
    completedAt?: Date | null;
    totalPausedMs: number;
}

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
    turnCount: number;
    timeline: SessionTimelineEventDto[];
    telemetry: SessionTelemetryDto;
    // Transitional compatibility for facade in Batch 15.2 (removed in Batch 15.3)
    transcript: SceneTurnResponseDto[];
    summary: SceneSessionSummaryResponseDto | null;
    maxDurationMinutes: number;
    pausedAt: Date | null;
    totalPausedMs: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
