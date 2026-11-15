import { ScenarioCategory } from '../../../../shared/domain/enums/scene-partner.enums';
import {AdminExportScenariosFilters,AdminScenarioExportItemFacadeDto} from '../interfaces/scene-partner-admin-facade.interface';

export interface ExportScenariosFilters extends AdminExportScenariosFilters { }

export class ScenarioExportItemDto implements AdminScenarioExportItemFacadeDto {
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
    createdAt: Date;
    updatedAt: Date;
}
