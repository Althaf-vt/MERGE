import { ScenarioInDepthDto, ScenarioTimeframe } from "../dtos/scenario-in-depth.dto";

export const GET_SCENARIO_IN_DEPTH_USE_CASE = 'GET_SCENARIO_IN_DEPTH_USE_CASE';

export interface IGetScenarioInDepthUseCase {
    execute(scenarioId: string, timeframe?: ScenarioTimeframe): Promise<ScenarioInDepthDto>;
}
