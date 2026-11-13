import { ScenarioCategory, SceneSessionStatus, SceneSpeakerRole, SimulationType } from "../../domain/enums/scene-partner.enums";

export interface CoachNoteResponseDto {
    observation: string;
    tone: string;
    pacing: string;
    nextTip: string;
}

export interface SceneTurnResponseDto {
    role: SceneSpeakerRole;
    content: string;
    coachNote: CoachNoteResponseDto | null;
    timestamp: Date;
}

export interface SceneSessionSummaryResponseDto {
    summary: string;
    thingsToNote: string[];
    takeaways: string[];
    coachingNotes: string;
    communicationScore?: number;
}

export interface SceneSessionResponseDto {
    id: string;
    userId: string;
    simulationType: SimulationType;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    targetUserId: string | null;
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

export interface PaginatedSceneSessionsResponseDto {
    data: SceneSessionResponseDto[];
    total: number;
}
