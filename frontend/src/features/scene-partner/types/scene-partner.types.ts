export type SceneSessionStatus = 'INITIALIZING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export type SimulationType = 'MATCH_BASED' | 'GENERIC';

export type SceneSpeakerRole = 'USER' | 'SIMULATION';

export type ScenarioCategory =
    | 'FIRST_MESSAGE'
    | 'ASKING_OUT'
    | 'RELATIONSHIP_GOALS'
    | 'LIFE_LOGISTICS'
    | 'ADOPTION'
    | 'IMMIGRATION'
    | 'CUSTOM';

export interface CoachNoteDto {
    observation: string;
    tone: string;
    pacing: string;
    nextTip: string;
}

export interface SceneTurnDto {
    role: SceneSpeakerRole;
    content: string;
    coachNote: CoachNoteDto | null;
    timestamp: string;
}

export interface SceneSessionSummaryDto {
    summary: string;
    thingsToNote: string[];
    takeaways: string[];
    coachingNotes: string;
    communicationScore?: number;
}

export interface SceneSessionDto {
    id: string;
    userId: string;
    simulationType: SimulationType;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    targetUserId: string | null;
    status: SceneSessionStatus;
    transcript: SceneTurnDto[];
    turnCount: number;
    summary: SceneSessionSummaryDto | null;
    maxDurationMinutes: number;
    pausedAt: string | null;
    totalPausedMs: number;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedSceneSessionsDto {
    data: SceneSessionDto[];
    total: number;
}

export interface ScenarioDto {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    creatorUserId?: string | null;
    createdAt?: string;
}

export interface StartSceneSessionPayload {
    scenarioId: string;
    simulationType: SimulationType;
    targetUserId?: string;
}

export interface SendSceneTurnPayload {
    sessionId: string;
    content: string;
}

export interface SessionActionPayload {
    sessionId: string;
}

export interface GetScenariosQuery {
    category?: ScenarioCategory;
}

export interface GetSceneHistoryQuery {
    limit?: number;
    skip?: number;
}

