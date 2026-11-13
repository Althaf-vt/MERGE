import { StartSceneSessionDto } from "../dtos/start-scene-session.dto";
import { SendSceneTurnDto } from "../dtos/send-scene-turn.dto";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ScenarioResponseDto } from "../dtos/scenario-response.dto";
import { ScenarioCategory } from "../../domain/enums/scene-partner.enums";

export const START_SCENE_SESSION_USE_CASE = "START_SCENE_SESSION_USE_CASE";
export const PAUSE_SCENE_SESSION_USE_CASE = "PAUSE_SCENE_SESSION_USE_CASE";
export const RESUME_SCENE_SESSION_USE_CASE = "RESUME_SCENE_SESSION_USE_CASE";
export const END_SCENE_SESSION_USE_CASE = "END_SCENE_SESSION_USE_CASE";
export const SEND_SCENE_TURN_USE_CASE = "SEND_SCENE_TURN_USE_CASE";
export const GET_ACTIVE_SCENE_SESSION_USE_CASE = "GET_ACTIVE_SCENE_SESSION_USE_CASE";
export const GET_SCENE_SESSION_BY_ID_USE_CASE = "GET_SCENE_SESSION_BY_ID_USE_CASE";
export const GET_SCENE_SESSION_HISTORY_USE_CASE = "GET_SCENE_SESSION_HISTORY_USE_CASE";
export const GET_SCENARIOS_USE_CASE = "GET_SCENARIOS_USE_CASE";

export interface IStartSceneSessionUseCase {
    execute(userId: string, dto: StartSceneSessionDto): Promise<SceneSessionResponseDto>;
}

export interface IPauseSceneSessionUseCase {
    execute(userId: string, sessionId: string): Promise<SceneSessionResponseDto>;
}

export interface IResumeSceneSessionUseCase {
    execute(userId: string, sessionId: string): Promise<SceneSessionResponseDto>;
}

export interface IEndSceneSessionUseCase {
    execute(userId: string, sessionId: string): Promise<SceneSessionResponseDto>;
}

export interface ISendSceneTurnUseCase {
    execute(userId: string, sessionId: string, dto: SendSceneTurnDto): Promise<SceneSessionResponseDto>;
}

export interface IGetActiveSceneSessionUseCase {
    execute(userId: string): Promise<SceneSessionResponseDto | null>;
}

export interface IGetSceneSessionByIdUseCase {
    execute(userId: string, sessionId: string): Promise<SceneSessionResponseDto>;
}

export interface IGetSceneSessionHistoryUseCase {
    execute(userId: string, limit?: number, skip?: number): Promise<PaginatedSceneSessionsResponseDto>;
}

export interface IGetScenariosUseCase {
    execute(category?: ScenarioCategory): Promise<ScenarioResponseDto[]>;
}
