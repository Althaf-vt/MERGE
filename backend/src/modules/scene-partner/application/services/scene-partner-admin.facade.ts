import { Inject, Injectable } from "@nestjs/common";
import {
    AdminCreateScenarioParams,
    AdminGetScenariosFilters,
    AdminGetSessionsFilters,
    AdminScenarioFacadeDto,
    AdminSessionDetailFacadeDto,
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

    async getSessions(filters: AdminGetSessionsFilters): Promise<PaginatedAdminSessionsFacadeResult> {
        return this._getAdminSessionsUseCase.execute(filters);
    }

    async getSessionDetails(sessionId: string): Promise<AdminSessionDetailFacadeDto> {
        return this._getAdminSessionDetailsUseCase.execute(sessionId);
    }

    async getAnalytics(): Promise<ScenePartnerAnalyticsFacadeDto> {
        return this._getScenePartnerAnalyticsUseCase.execute();
    }
}