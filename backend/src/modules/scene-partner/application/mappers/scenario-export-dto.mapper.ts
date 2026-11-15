import { Scenario } from '../../domain/entities/scenario.entity';
import { ScenarioMetricsRawData } from '../../domain/interfaces/scene-session-repository.interface';
import { ScenarioExportItemDto } from '../dtos/scenario-export.dto';

export class ScenarioExportDtoMapper {
    public static toExportItemDto(scenario: Scenario, metrics?: ScenarioMetricsRawData): ScenarioExportItemDto {
        const totalSessions = metrics?.totalSessions ?? 0;
        const completedSessions = metrics?.completedSessions ?? 0;
        const completionRate =
            totalSessions > 0
                ? Math.round((completedSessions / totalSessions) * 1000) / 10
                : 0;

        return {
            id: scenario.id,
            title: scenario.title,
            category: scenario.category,
            description: scenario.description,
            promptContext: scenario.promptContext,
            isActive: scenario.isActive,
            isCustom: scenario.isCustom,
            creatorUserId: scenario.creatorUserId,
            totalSessions,
            completedSessions,
            completionRate,
            createdAt: scenario.createdAt,
            updatedAt: scenario.updatedAt,
        };
    }

    public static toExportItemDtoList(scenarios: Scenario[], metricsMap?: Record<string, ScenarioMetricsRawData>): ScenarioExportItemDto[] {
        return scenarios.map((scenario) =>
            ScenarioExportDtoMapper.toExportItemDto(
                scenario,
                metricsMap ? metricsMap[scenario.id] : undefined,
            ),
        );
    }
}
