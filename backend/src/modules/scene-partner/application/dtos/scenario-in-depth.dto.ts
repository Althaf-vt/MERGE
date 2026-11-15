import { AdminScenarioResponseDto, ScenarioSummaryStatsDto } from "./admin-scenario-response.dto";
import { AdminSessionListItemDto } from "./admin-session-list-item.dto";

export type ScenarioTimeframe = '7D' | '30D' | '90D';

export interface ScenarioTrendPointDto {
    date: string;
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
}

export interface ScenarioInDepthDto {
    scenario: AdminScenarioResponseDto;
    summary: ScenarioSummaryStatsDto;
    timeframe: ScenarioTimeframe;
    trends: ScenarioTrendPointDto[];
    recentSessions: AdminSessionListItemDto[];
}
