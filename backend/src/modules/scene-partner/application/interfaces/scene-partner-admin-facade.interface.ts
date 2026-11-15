import { ScenarioCategory, SceneSessionStatus, SceneSpeakerRole, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";

export interface AdminCreateScenarioParams {
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
}

export interface AdminUpdateScenarioParams {
    title?: string;
    description?: string;
    category?: ScenarioCategory;
    promptContext?: string;
}

export interface AdminToggleScenarioStatusParams {
    isActive: boolean;
}

export interface AdminGetScenariosFilters {
    category?: ScenarioCategory;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface AdminGetSessionsFilters {
    userId?: string;
    scenarioId?: string;
    simulationType?: SimulationType;
    status?: SceneSessionStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

export interface AdminScenarioFacadeDto {
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

export interface PaginatedAdminScenariosFacadeResult {
    data: AdminScenarioFacadeDto[];
    total: number;
    page: number;
    limit: number;
}

export interface AdminSessionListItemFacadeDto {
    id: string;
    userId: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    simulationType: SimulationType;
    status: SceneSessionStatus;
    turnCount: number;
    communicationScore?: number | null;
    isCoachingEnabled: boolean;
    createdAt: Date;
    completedAt?: Date | null;
}

export interface PaginatedAdminSessionsFacadeResult {
    data: AdminSessionListItemFacadeDto[];
    total: number;
    page: number;
    limit: number;
}

export interface CoachNoteFacadeDto {
    observation: string;
    tone: string;
    pacing: string;
    nextTip: string;
}

export interface AdminSessionTurnFacadeDto {
    role: SceneSpeakerRole;
    content: string;
    coachNote: CoachNoteFacadeDto | null;
    timestamp: Date;
}

export interface AdminSessionSummaryFacadeDto {
    summary: string;
    thingsToNote: string[];
    takeaways: string[];
    coachingNotes: string;
    communicationScore?: number;
}

export interface AdminSessionDetailFacadeDto {
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
    transcript: AdminSessionTurnFacadeDto[];
    turnCount: number;
    summary: AdminSessionSummaryFacadeDto | null;
    maxDurationMinutes: number;
    pausedAt: Date | null;
    totalPausedMs: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ScenarioPopularityFacadeDto {
    scenarioId: string;
    scenarioTitle: string;
    category: ScenarioCategory;
    count: number;
}

export interface CategoryDistributionFacadeDto {
    category: ScenarioCategory;
    count: number;
}

export interface ScenePartnerAnalyticsFacadeDto {
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
    topScenarios: ScenarioPopularityFacadeDto[];
    categoryDistribution: CategoryDistributionFacadeDto[];
}

export const SCENE_PARTNER_ADMIN_FACADE = "SCENE_PARTNER_ADMIN_FACADE";

export interface IScenePartnerAdminFacade {
    // Scenario Administration
    createScenario(params: AdminCreateScenarioParams): Promise<AdminScenarioFacadeDto>;
    updateScenario(id: string, params: AdminUpdateScenarioParams): Promise<AdminScenarioFacadeDto>;
    toggleScenarioStatus(id: string, params: AdminToggleScenarioStatusParams): Promise<AdminScenarioFacadeDto>;
    getScenarios(filters: AdminGetScenariosFilters): Promise<PaginatedAdminScenariosFacadeResult>;
    getScenarioById(id: string): Promise<AdminScenarioFacadeDto>;

    // Session Inspection & Audit Logs
    getSessions(filters: AdminGetSessionsFilters): Promise<PaginatedAdminSessionsFacadeResult>;
    getSessionDetails(sessionId: string): Promise<AdminSessionDetailFacadeDto>;

    // Platform Analytics
    getAnalytics(): Promise<ScenePartnerAnalyticsFacadeDto>;
}
