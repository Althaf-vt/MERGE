import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { Scenario } from "../entities/scenario.entity";
import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";

export const SCENARIO_REPOSITORY = 'SCENARIO_REPOSITORY';

export interface AdminScenariosFilter {
    category?: ScenarioCategory;
    isActive?: boolean;
    search?: string;
    limit?: number;
    skip?: number;
}

export interface PaginatedAdminScenariosResult {
    data: Scenario[];
    total: number;
}

export interface IScenarioRepository extends IBaseRepository<Scenario> {
    findActive(category?: ScenarioCategory): Promise<Scenario[]>;
    findAllAdmin(filter: AdminScenariosFilter): Promise<PaginatedAdminScenariosResult>;
    count(): Promise<number>;
}
