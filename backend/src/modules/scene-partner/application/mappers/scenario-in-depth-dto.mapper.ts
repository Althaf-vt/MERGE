import { Scenario } from "../../domain/entities/scenario.entity";
import { SceneSession } from "../../domain/entities/scene-session.entity";
import { ScenarioDailyTrendRawData, ScenarioSummaryStatsRawData } from "../../domain/interfaces/scene-session-repository.interface";
import { ScenarioDtoMapper } from "./scenario-dto.mapper";
import { SceneSessionDtoMapper } from "./scene-session-dto.mapper";
import { ScenarioInDepthDto, ScenarioTimeframe, ScenarioTrendPointDto } from "../dtos/scenario-in-depth.dto";

export class ScenarioInDepthDtoMapper {
    public static toTrendPointDto(raw: ScenarioDailyTrendRawData): ScenarioTrendPointDto {
        return {
            date: raw.date,
            totalSessions: raw.totalSessions,
            completedSessions: raw.completedSessions,
            completionRate: raw.completionRate,
        };
    }

    public static toTrendPointDtoList(rawList: ScenarioDailyTrendRawData[]): ScenarioTrendPointDto[] {
        return rawList.map((item) => this.toTrendPointDto(item));
    }

    public static toDto(params: {
        scenario: Scenario;
        summary: ScenarioSummaryStatsRawData | null;
        timeframe: ScenarioTimeframe;
        trends: ScenarioDailyTrendRawData[];
        recentSessions: SceneSession[];
    }): ScenarioInDepthDto {
        const scenarioDto = ScenarioDtoMapper.toAdminResponseDto(params.scenario, params.summary);
        const summaryDto = scenarioDto.summary ?? {
            totalSessions: 0,
            completedSessions: 0,
            completionRate: 0,
            averageDurationMinutes: 0,
            averageTurnCount: 0,
            coachingAdoptionRate: 0,
        };

        return {
            scenario: scenarioDto,
            summary: summaryDto,
            timeframe: params.timeframe,
            trends: this.toTrendPointDtoList(params.trends),
            recentSessions: SceneSessionDtoMapper.toAdminListItemDtoList(params.recentSessions),
        };
    }
}
