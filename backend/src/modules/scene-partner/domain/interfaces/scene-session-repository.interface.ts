import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { SceneSession } from "../entities/scene-session.entity";
import { ScenarioCategory, SceneSessionStatus, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";

export const SCENE_SESSION_REPOSITORY = 'SCENE_SESSION_REPOSITORY';

export interface PaginatedSceneSessionsResult {
    data: SceneSession[];
    total: number;
}

export interface AdminSessionsFilter {
    userId?: string;
    scenarioId?: string;
    simulationType?: SimulationType;
    status?: SceneSessionStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
}

export interface ScenarioPopularityRawData {
    scenarioId: string;
    scenarioTitle: string;
    category: ScenarioCategory;
    count: number;
}

export interface CategoryDistributionRawData {
    category: ScenarioCategory;
    count: number;
}

export interface ScenePartnerAnalyticsRawData {
    totalSessions: number;
    completedSessions: number;
    inProgressSessions: number;
    pausedSessions: number;
    coachingEnabledCount: number;
    coachingDisabledCount: number;
    genericCount: number;
    matchBasedCount: number;
    averageScore: number | null;
    averageTurnCount: number;
    topScenarios: ScenarioPopularityRawData[];
    categoryDistribution: CategoryDistributionRawData[];
}

export interface ISceneSessionRepository extends IBaseRepository<SceneSession> {
    findActiveByUserId(userId: string): Promise<SceneSession | null>;
    findAllByUserId(userId: string, limit?: number, skip?: number): Promise<PaginatedSceneSessionsResult>;
    findAdminSessions(filter: AdminSessionsFilter): Promise<PaginatedSceneSessionsResult>;
    getAnalytics(): Promise<ScenePartnerAnalyticsRawData>;
    getScenarioMetricsMap(): Promise<Record<string, { totalSessions: number; completedSessions: number }>>;
    deleteById(id: string, userId: string): Promise<boolean>;
}
