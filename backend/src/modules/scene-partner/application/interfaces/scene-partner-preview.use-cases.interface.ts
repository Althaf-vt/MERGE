import { StartScenePreviewDto, SendScenePreviewTurnDto, ScenePreviewResponseDto } from "../dtos/preview-session.dto";
import { SceneSimulationContext } from "../../domain/interfaces/scene-partner-ai.interface";
import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";

export const START_PREVIEW_SESSION_USE_CASE = "START_PREVIEW_SESSION_USE_CASE";
export const SEND_PREVIEW_TURN_USE_CASE = "SEND_PREVIEW_TURN_USE_CASE";
export const PREVIEW_CONTEXT_BUILDER = "PREVIEW_CONTEXT_BUILDER";

export interface BuildPreviewContextParams {
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    promptContext: string;
    adminName?: string;
}

export interface IPreviewContextBuilder {
    build(params: BuildPreviewContextParams): SceneSimulationContext;
}

export interface IStartPreviewSessionUseCase {
    execute(adminId: string, dto: StartScenePreviewDto): Promise<ScenePreviewResponseDto>;
}

export interface ISendPreviewTurnUseCase {
    execute(adminId: string, sessionId: string, dto: SendScenePreviewTurnDto): Promise<ScenePreviewResponseDto>;
}
