import { Inject, Injectable } from '@nestjs/common';
import { IScenarioRepository, SCENARIO_REPOSITORY } from '../../domain/interfaces/scenario-repository.interface';
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY, ScenarioMetricsRawData } from '../../domain/interfaces/scene-session-repository.interface';
import { ExportScenariosFilters, ScenarioExportItemDto } from '../dtos/scenario-export.dto';
import { IExportScenariosUseCase } from '../interfaces/scene-partner-export.use-cases.interface';
import { ScenarioExportDtoMapper } from '../mappers/scenario-export-dto.mapper';

@Injectable()
export class ExportScenariosUseCase implements IExportScenariosUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sceneSessionRepository: ISceneSessionRepository,
    ) { }

    async execute(filters?: ExportScenariosFilters): Promise<ScenarioExportItemDto[]> {
        const scenarios = await this._scenarioRepository.findForExport({
            category: filters?.category,
            isActive: filters?.isActive,
        });

        const shouldIncludeMetrics = filters?.includeMetrics !== false;

        let metricsMap: Record<string, ScenarioMetricsRawData> | undefined;

        if (shouldIncludeMetrics) {
            metricsMap = await this._sceneSessionRepository.getScenarioMetricsMap();
        }

        return ScenarioExportDtoMapper.toExportItemDtoList(scenarios, metricsMap);
    }
}
