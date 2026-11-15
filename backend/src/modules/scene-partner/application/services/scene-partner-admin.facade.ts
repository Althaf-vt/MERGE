import { Inject, Injectable } from "@nestjs/common";
import { IScenePartnerAdminFacade } from "../interfaces/scene-partner-admin-facade.interface";
import { CreateScenarioDto } from "../dtos/create-scenario.dto";
import { UpdateScenarioDto } from "../dtos/update-scenario.dto";
import { ToggleScenarioStatusDto } from "../dtos/toggle-scenario-status.dto";
import { GetAdminScenariosQueryDto } from "../dtos/get-admin-scenarios-query.dto";
import { AdminScenarioResponseDto, PaginatedAdminScenariosResponseDto } from "../dtos/admin-scenario-response.dto";
import { GetAdminSessionsQueryDto } from "../dtos/get-admin-sessions-query.dto";
import { PaginatedAdminSessionsResponseDto } from "../dtos/admin-session-list-item.dto";
import { AdminSessionDetailDto } from "../dtos/admin-session-detail.dto";
import { ScenePartnerAnalyticsDto } from "../dtos/scene-partner-analytics.dto";
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

    async createScenario(dto: CreateScenarioDto): Promise<AdminScenarioResponseDto> {
        return this._createScenarioUseCase.execute(dto);
    }

    async updateScenario(id: string, dto: UpdateScenarioDto): Promise<AdminScenarioResponseDto> {
        return this._updateScenarioUseCase.execute(id, dto);
    }

    async toggleScenarioStatus(id: string, dto: ToggleScenarioStatusDto): Promise<AdminScenarioResponseDto> {
        return this._toggleScenarioStatusUseCase.execute(id, dto);
    }

    async getScenarios(query: GetAdminScenariosQueryDto): Promise<PaginatedAdminScenariosResponseDto> {
        return this._getAdminScenariosUseCase.execute(query);
    }

    async getScenarioById(id: string): Promise<AdminScenarioResponseDto> {
        return this._getAdminScenarioByIdUseCase.execute(id);
    }

    async getSessions(query: GetAdminSessionsQueryDto): Promise<PaginatedAdminSessionsResponseDto> {
        return this._getAdminSessionsUseCase.execute(query);
    }

    async getSessionDetails(sessionId: string): Promise<AdminSessionDetailDto> {
        return this._getAdminSessionDetailsUseCase.execute(sessionId);
    }

    async getAnalytics(): Promise<ScenePartnerAnalyticsDto> {
        return this._getScenePartnerAnalyticsUseCase.execute();
    }
}
