import { Inject, Injectable } from "@nestjs/common";
import { ScenarioTimeframe } from "../../../../shared/domain/enums/scene-partner.enums";
import {
    AdminCreateScenarioParams,
    AdminExportScenariosFilters,
    AdminGetScenariosFilters,
    AdminGetSessionsFilters,
    AdminPreviewSessionFacadeDto,
    AdminScenarioExportItemFacadeDto,
    AdminScenarioFacadeDto,
    AdminScenarioInDepthFacadeDto,
    AdminSendPreviewTurnParams,
    AdminSessionDetailFacadeDto,
    AdminStartPreviewSessionParams,
    AdminToggleScenarioStatusParams,
    AdminUpdateScenarioParams,
    IScenePartnerAdminFacade,
    PaginatedAdminScenariosFacadeResult,
    PaginatedAdminSessionsFacadeResult,
    ScenePartnerAnalyticsFacadeDto,
} from "../interfaces/scene-partner-admin-facade.interface";
import {
    CREATE_SCENARIO_USE_CASE,
    GET_ADMIN_SCENARIO_BY_ID_USE_CASE,
    GET_ADMIN_SCENARIOS_USE_CASE,
    GET_ADMIN_SESSION_DETAILS_USE_CASE,
    GET_ADMIN_SESSIONS_USE_CASE,
    GET_SCENE_PARTNER_ANALYTICS_USE_CASE,
    ICreateScenarioUseCase,
    IGetAdminScenarioByIdUseCase,
    IGetAdminScenariosUseCase,
    IGetAdminSessionDetailsUseCase,
    IGetAdminSessionsUseCase,
    IGetScenePartnerAnalyticsUseCase,
    IToggleScenarioStatusUseCase,
    IUpdateScenarioUseCase,
    TOGGLE_SCENARIO_STATUS_USE_CASE,
    UPDATE_SCENARIO_USE_CASE,
} from "../interfaces/scene-partner-admin.use-cases.interface";
import { ISendPreviewTurnUseCase, IStartPreviewSessionUseCase, SEND_PREVIEW_TURN_USE_CASE, START_PREVIEW_SESSION_USE_CASE } from "../interfaces/scene-partner-preview.use-cases.interface";
import { IUpdateCoachingModeUseCase, UPDATE_COACHING_MODE_USE_CASE } from "../interfaces/scene-partner.use-cases.interface";
import { EXPORT_SCENARIOS_USE_CASE, IExportScenariosUseCase } from "../interfaces/scene-partner-export.use-cases.interface";
import { GET_SCENARIO_IN_DEPTH_USE_CASE, IGetScenarioInDepthUseCase } from "../interfaces/scene-partner-in-depth.use-cases.interface";

@Injectable()
export class ScenePartnerAdminFacade implements IScenePartnerAdminFacade {
    constructor(
        @Inject(CREATE_SCENARIO_USE_CASE) private readonly _createScenarioUseCase: ICreateScenarioUseCase,
        @Inject(UPDATE_SCENARIO_USE_CASE) private readonly _updateScenarioUseCase: IUpdateScenarioUseCase,
        @Inject(TOGGLE_SCENARIO_STATUS_USE_CASE) private readonly _toggleScenarioStatusUseCase: IToggleScenarioStatusUseCase,
        @Inject(GET_ADMIN_SCENARIOS_USE_CASE) private readonly _getAdminScenariosUseCase: IGetAdminScenariosUseCase,
        @Inject(GET_ADMIN_SCENARIO_BY_ID_USE_CASE) private readonly _getAdminScenarioByIdUseCase: IGetAdminScenarioByIdUseCase,
        @Inject(GET_ADMIN_SESSIONS_USE_CASE) private readonly _getAdminSessionsUseCase: IGetAdminSessionsUseCase,
        @Inject(GET_ADMIN_SESSION_DETAILS_USE_CASE) private readonly _getAdminSessionDetailsUseCase: IGetAdminSessionDetailsUseCase,
        @Inject(GET_SCENE_PARTNER_ANALYTICS_USE_CASE) private readonly _getScenePartnerAnalyticsUseCase: IGetScenePartnerAnalyticsUseCase,
        @Inject(START_PREVIEW_SESSION_USE_CASE) private readonly _startPreviewSessionUseCase: IStartPreviewSessionUseCase,
        @Inject(SEND_PREVIEW_TURN_USE_CASE) private readonly _sendPreviewTurnUseCase: ISendPreviewTurnUseCase,
        @Inject(UPDATE_COACHING_MODE_USE_CASE) private readonly _updateCoachingModeUseCase: IUpdateCoachingModeUseCase,
        @Inject(EXPORT_SCENARIOS_USE_CASE) private readonly _exportScenariosUseCase: IExportScenariosUseCase,
        @Inject(GET_SCENARIO_IN_DEPTH_USE_CASE) private readonly _getScenarioInDepthUseCase: IGetScenarioInDepthUseCase,
    ) { }

    async createScenario(params: AdminCreateScenarioParams): Promise<AdminScenarioFacadeDto> {
        return this._createScenarioUseCase.execute(params);
    }

    async updateScenario(id: string, params: AdminUpdateScenarioParams): Promise<AdminScenarioFacadeDto> {
        return this._updateScenarioUseCase.execute(id, params);
    }

    async toggleScenarioStatus(id: string, params: AdminToggleScenarioStatusParams): Promise<AdminScenarioFacadeDto> {
        return this._toggleScenarioStatusUseCase.execute(id, params);
    }

    async getScenarios(filters: AdminGetScenariosFilters): Promise<PaginatedAdminScenariosFacadeResult> {
        return this._getAdminScenariosUseCase.execute(filters);
    }

    async getScenarioById(id: string): Promise<AdminScenarioFacadeDto> {
        return this._getAdminScenarioByIdUseCase.execute(id);
    }

    async getScenarioInDepth(id: string, timeframe?: ScenarioTimeframe): Promise<AdminScenarioInDepthFacadeDto> {
        return this._getScenarioInDepthUseCase.execute(id, timeframe);
    }

    async getSessions(filters: AdminGetSessionsFilters): Promise<PaginatedAdminSessionsFacadeResult> {
        return this._getAdminSessionsUseCase.execute(filters);
    }

    async getSessionDetails(sessionId: string): Promise<AdminSessionDetailFacadeDto> {
        return this._getAdminSessionDetailsUseCase.execute(sessionId);
    }

    async getAnalytics(): Promise<ScenePartnerAnalyticsFacadeDto> {
        return this._getScenePartnerAnalyticsUseCase.execute();
    }

    async startPreviewSession(adminId: string, params: AdminStartPreviewSessionParams): Promise<AdminPreviewSessionFacadeDto> {
        return this._startPreviewSessionUseCase.execute(adminId, params);
    }

    async sendPreviewTurn(adminId: string, sessionId: string, params: AdminSendPreviewTurnParams): Promise<AdminPreviewSessionFacadeDto> {
        return this._sendPreviewTurnUseCase.execute(adminId, sessionId, params);
    }

    async updatePreviewCoachingMode(adminId: string, sessionId: string, params: { isCoachingEnabled: boolean }): Promise<AdminPreviewSessionFacadeDto> {
        const session = await this._updateCoachingModeUseCase.execute(adminId, sessionId, params);
        return {
            id: session.id,
            scenarioId: session.scenarioId,
            scenarioTitle: session.scenarioTitle,
            scenarioCategory: session.scenarioCategory,
            scenarioPromptContext: session.scenarioPromptContext ?? null,
            isCoachingEnabled: session.isCoachingEnabled,
            status: session.status,
            transcript: session.transcript,
            turnCount: session.turnCount,
            isPreview: true,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        };
    }

    async exportScenarios(filters?: AdminExportScenariosFilters): Promise<AdminScenarioExportItemFacadeDto[]> {
        return this._exportScenariosUseCase.execute(filters);
    }
}
