import { ScenarioTimeframe } from "../../../../shared/domain/enums/scene-partner.enums";
import { AdminScenarioResponseDto, ScenarioSummaryStatsDto } from "./admin-scenario-response.dto";
import { AdminSessionListItemDto } from "./admin-session-list-item.dto";

export { ScenarioTimeframe };

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
