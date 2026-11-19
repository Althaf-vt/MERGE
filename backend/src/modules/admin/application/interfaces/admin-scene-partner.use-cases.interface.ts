import { ScenarioTimeframe } from "../../../../shared/domain/enums/scene-partner.enums";
import {
    AdminPreviewSessionFacadeDto,
    AdminScenarioExportItemFacadeDto,
    AdminScenarioFacadeDto,
    AdminScenarioInDepthFacadeDto,
    AdminSessionDetailFacadeDto,
    AdminStartPreviewSessionParams,
    PaginatedAdminScenariosFacadeResult,
    PaginatedAdminSessionsFacadeResult,
    ScenePartnerAnalyticsFacadeDto,
} from "../../../scene-partner/application/interfaces/scene-partner-admin-facade.interface";
import {
    AdminCreateScenarioDto,
    AdminExportScenariosQueryDto,
    AdminGetScenariosQueryDto,
    AdminGetSessionsQueryDto,
    AdminSendPreviewTurnDto,
    AdminToggleScenarioStatusDto,
    AdminUpdatePreviewCoachingDto,
    AdminUpdateScenarioDto,
} from "../dtos/admin-scene-partner.dto";

// Scenario Administration Tokens & Interfaces

export const ADMIN_CREATE_SCENARIO_USE_CASE = "ADMIN_CREATE_SCENARIO_USE_CASE";
export interface IAdminCreateScenarioUseCase {
    execute(dto: AdminCreateScenarioDto): Promise<AdminScenarioFacadeDto>;
}

export const ADMIN_GET_SCENARIOS_USE_CASE = "ADMIN_GET_SCENARIOS_USE_CASE";
export interface IAdminGetScenariosUseCase {
    execute(query: AdminGetScenariosQueryDto): Promise<PaginatedAdminScenariosFacadeResult>;
}

export const ADMIN_GET_SCENARIO_BY_ID_USE_CASE = "ADMIN_GET_SCENARIO_BY_ID_USE_CASE";
export interface IAdminGetScenarioByIdUseCase {
    execute(id: string): Promise<AdminScenarioFacadeDto>;
}

export const ADMIN_GET_SCENARIO_IN_DEPTH_USE_CASE = "ADMIN_GET_SCENARIO_IN_DEPTH_USE_CASE";
export interface IAdminGetScenarioInDepthUseCase {
    execute(id: string, timeframe?: ScenarioTimeframe): Promise<AdminScenarioInDepthFacadeDto>;
}

export const ADMIN_UPDATE_SCENARIO_USE_CASE = "ADMIN_UPDATE_SCENARIO_USE_CASE";
export interface IAdminUpdateScenarioUseCase {
    execute(id: string, dto: AdminUpdateScenarioDto): Promise<AdminScenarioFacadeDto>;
}

export const ADMIN_TOGGLE_SCENARIO_STATUS_USE_CASE = "ADMIN_TOGGLE_SCENARIO_STATUS_USE_CASE";
export interface IAdminToggleScenarioStatusUseCase {
    execute(id: string, dto: AdminToggleScenarioStatusDto): Promise<AdminScenarioFacadeDto>;
}

export const ADMIN_EXPORT_SCENARIOS_USE_CASE = "ADMIN_EXPORT_SCENARIOS_USE_CASE";
export interface IAdminExportScenariosUseCase {
    execute(query: AdminExportScenariosQueryDto): Promise<AdminScenarioExportItemFacadeDto[]>;
}

// Scene Sessions, Analytics & Preview Tokens & Interfaces

export const ADMIN_GET_SCENE_ANALYTICS_USE_CASE = "ADMIN_GET_SCENE_ANALYTICS_USE_CASE";
export interface IAdminGetSceneAnalyticsUseCase {
    execute(): Promise<ScenePartnerAnalyticsFacadeDto>;
}

export const ADMIN_GET_SCENE_SESSIONS_USE_CASE = "ADMIN_GET_SCENE_SESSIONS_USE_CASE";
export interface IAdminGetSceneSessionsUseCase {
    execute(query: AdminGetSessionsQueryDto): Promise<PaginatedAdminSessionsFacadeResult>;
}

export const ADMIN_GET_SCENE_SESSION_DETAILS_USE_CASE = "ADMIN_GET_SCENE_SESSION_DETAILS_USE_CASE";
export interface IAdminGetSceneSessionDetailsUseCase {
    execute(id: string): Promise<AdminSessionDetailFacadeDto>;
}

export const ADMIN_START_PREVIEW_SESSION_USE_CASE = "ADMIN_START_PREVIEW_SESSION_USE_CASE";
export interface IAdminStartPreviewSessionUseCase {
    execute(adminId: string, params: AdminStartPreviewSessionParams): Promise<AdminPreviewSessionFacadeDto>;
}

export const ADMIN_SEND_PREVIEW_TURN_USE_CASE = "ADMIN_SEND_PREVIEW_TURN_USE_CASE";
export interface IAdminSendPreviewTurnUseCase {
    execute(adminId: string, sessionId: string, dto: AdminSendPreviewTurnDto): Promise<AdminPreviewSessionFacadeDto>;
}

export const ADMIN_UPDATE_PREVIEW_COACHING_USE_CASE = "ADMIN_UPDATE_PREVIEW_COACHING_USE_CASE";
export interface IAdminUpdatePreviewCoachingUseCase {
    execute(adminId: string, sessionId: string, dto: AdminUpdatePreviewCoachingDto): Promise<AdminPreviewSessionFacadeDto>;
}
