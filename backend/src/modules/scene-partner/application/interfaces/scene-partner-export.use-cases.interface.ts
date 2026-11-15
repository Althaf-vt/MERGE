import { ExportScenariosFilters, ScenarioExportItemDto } from '../dtos/scenario-export.dto';

export const EXPORT_SCENARIOS_USE_CASE = 'EXPORT_SCENARIOS_USE_CASE';

export interface IExportScenariosUseCase {
    execute(filters?: ExportScenariosFilters): Promise<ScenarioExportItemDto[]>;
}
