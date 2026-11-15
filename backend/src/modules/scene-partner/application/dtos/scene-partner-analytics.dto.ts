import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";

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
