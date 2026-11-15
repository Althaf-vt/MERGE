import { ScenarioCategory } from '../../../../shared/domain/enums/scene-partner.enums';

export interface ExportScenariosFilters {
    category?: ScenarioCategory;
    isActive?: boolean;
    includeMetrics?: boolean;
}

export class ScenarioExportItemDto {
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
