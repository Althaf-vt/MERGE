import { CreateScenarioDto } from "../dtos/create-scenario.dto";
import { UpdateScenarioDto } from "../dtos/update-scenario.dto";
import { ToggleScenarioStatusDto } from "../dtos/toggle-scenario-status.dto";
import { GetAdminScenariosQueryDto } from "../dtos/get-admin-scenarios-query.dto";
import { AdminScenarioResponseDto, PaginatedAdminScenariosResponseDto } from "../dtos/admin-scenario-response.dto";

export const CREATE_SCENARIO_USE_CASE = "CREATE_SCENARIO_USE_CASE";
export const UPDATE_SCENARIO_USE_CASE = "UPDATE_SCENARIO_USE_CASE";
export const TOGGLE_SCENARIO_STATUS_USE_CASE = "TOGGLE_SCENARIO_STATUS_USE_CASE";
export const GET_ADMIN_SCENARIOS_USE_CASE = "GET_ADMIN_SCENARIOS_USE_CASE";
export const GET_ADMIN_SCENARIO_BY_ID_USE_CASE = "GET_ADMIN_SCENARIO_BY_ID_USE_CASE";

export interface ICreateScenarioUseCase {
    execute(dto: CreateScenarioDto): Promise<AdminScenarioResponseDto>;
}

export interface IUpdateScenarioUseCase {
    execute(id: string, dto: UpdateScenarioDto): Promise<AdminScenarioResponseDto>;
}

export interface IToggleScenarioStatusUseCase {
    execute(id: string, dto: ToggleScenarioStatusDto): Promise<AdminScenarioResponseDto>;
}

export interface IGetAdminScenariosUseCase {
    execute(query: GetAdminScenariosQueryDto): Promise<PaginatedAdminScenariosResponseDto>;
}

export interface IGetAdminScenarioByIdUseCase {
    execute(id: string): Promise<AdminScenarioResponseDto>;
}
