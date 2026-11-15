export type ScenarioCategory =
    | 'FIRST_MESSAGE'
    | 'ASKING_OUT'
    | 'RELATIONSHIP_GOALS'
    | 'LIFE_LOGISTICS'
    | 'ADOPTION'
    | 'IMMIGRATION'
    | 'CUSTOM';

export type SceneSessionStatus =
    | 'INITIALIZING'
    | 'IN_PROGRESS'
    | 'PAUSED'
    | 'COMPLETED';

export type SimulationType =
    | 'MATCH_BASED'
    | 'GENERIC';

export type SceneSpeakerRole =
    | 'USER'
    | 'SIMULATION';

export type SessionTimelineEventType =
    | 'SESSION_INITIALIZED'
    | 'PARTNER_GREETING_DELIVERED'
    | 'USER_MESSAGE_SENT'
    | 'COACHING_TIP_GENERATED'
    | 'SESSION_PAUSED'
    | 'SESSION_RESUMED'
    | 'SESSION_COMPLETED';

export type ScenarioTimeframe =
    | '7D'
    | '30D'
    | '90D';

export type ScenarioExportFormat =
    | 'json'
    | 'csv';

export type AdminAuditAction =
    | 'SCENARIO_CREATED'
    | 'SCENARIO_UPDATED'
    | 'STATUS_ACTIVATED'
    | 'STATUS_DEACTIVATED';

export interface ScenarioSummaryStatsDto {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    averageDurationMinutes: number;
    averageTurnCount: number;
    coachingAdoptionRate: number;
}

export interface AdminScenarioDto {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    isActive: boolean;
    creatorUserId: string | null;
    summary?: ScenarioSummaryStatsDto | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedAdminScenariosResult {
    data: AdminScenarioDto[];
    total: number;
    page: number;
    limit: number;
}

export interface ScenarioTrendPointDto {
    date: string;
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
}

export interface AdminScenarioInDepthDto {
    scenario: AdminScenarioDto;
    summary: ScenarioSummaryStatsDto;
    timeframe: ScenarioTimeframe;
    trends: ScenarioTrendPointDto[];
    recentSessions: AdminSessionListItemDto[];
}

export interface AdminScenarioExportItemDto {
    id: string;
    title: string;
    category: ScenarioCategory;
    description: string;
    promptContext: string;
    isActive: boolean;
    isCustom: boolean;
    creatorUserId: string | null;
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    createdAt: string;
    updatedAt: string;
}

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
    createdAt: string;
    completedAt?: string | null;
}

export interface PaginatedAdminSessionsResult {
    data: AdminSessionListItemDto[];
    total: number;
    page: number;
    limit: number;
}

export interface CoachNoteDto {
    observation: string;
    tone: string;
    pacing: string;
    nextTip: string;
}

export interface AdminSessionTurnDto {
    role: SceneSpeakerRole;
    content: string;
    coachNote: CoachNoteDto | null;
    timestamp: string;
}

export interface SessionTimelineEventDto {
    id: string;
    eventType: SessionTimelineEventType;
    timestamp: string;
    metadata?: Record<string, unknown> | null;
}

export interface SessionTelemetryDto {
    durationMinutes: number;
    turnCount: number;
    coachingInterventionCount: number;
    isCoachingEnabled: boolean;
    completedAt?: string | null;
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
    maxDurationMinutes: number;
    pausedAt: string | null;
    totalPausedMs: number;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    transcript?: AdminSessionTurnDto[];
}

export interface ScenarioPopularityDto {
    scenarioId: string;
    scenarioTitle: string;
    category: ScenarioCategory;
    count: number;
}

export interface CategoryDistributionDto {
    category: ScenarioCategory;
    count: number;
}

export interface ScenePartnerAnalyticsDto {
    totalSessions: number;
    completedSessions: number;
    inProgressSessions: number;
    pausedSessions: number;
    completionRate: number;
    coachingEnabledCount: number;
    coachingDisabledCount: number;
    coachingAdoptionRate: number;
    genericCount: number;
    matchBasedCount: number;
    averageScore: number | null;
    averageTurnCount: number;
    topScenarios: ScenarioPopularityDto[];
    categoryDistribution: CategoryDistributionDto[];
}

export interface AdminPreviewSessionDto {
    id: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    scenarioPromptContext: string | null;
    isCoachingEnabled: boolean;
    status: SceneSessionStatus;
    transcript: AdminSessionTurnDto[];
    turnCount: number;
    isPreview: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminAuditLogDto {
    id: string;
    adminId: string;
    adminEmail: string | null;
    adminName: string | null;
    action: AdminAuditAction | string;
    resourceType: string;
    resourceId: string;
    details: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export interface GetAdminScenariosQuery {
    category?: ScenarioCategory;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateScenarioPayload {
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
}

export interface UpdateScenarioPayload {
    title?: string;
    description?: string;
    category?: ScenarioCategory;
    promptContext?: string;
}

export interface ToggleScenarioStatusPayload {
    isActive: boolean;
}

export interface GetAdminSessionsQuery {
    userId?: string;
    scenarioId?: string;
    simulationType?: SimulationType;
    status?: SceneSessionStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface GetScenarioInDepthQuery {
    timeframe?: ScenarioTimeframe;
}

export interface GetScenarioActivityHistoryQuery {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

export interface StartPreviewSessionPayload {
    scenarioId?: string;
    title?: string;
    category?: ScenarioCategory;
    promptContext?: string;
    isCoachingEnabled?: boolean;
}

export interface SendPreviewTurnPayload {
    content: string;
}

export interface ExportScenariosQuery {
    format?: ScenarioExportFormat;
    category?: ScenarioCategory;
    isActive?: boolean;
    includeMetrics?: boolean;
}
