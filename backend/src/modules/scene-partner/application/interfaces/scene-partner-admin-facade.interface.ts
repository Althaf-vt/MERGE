import { CreateScenarioDto } from "../dtos/create-scenario.dto";
import { UpdateScenarioDto } from "../dtos/update-scenario.dto";
import { ToggleScenarioStatusDto } from "../dtos/toggle-scenario-status.dto";
import { GetAdminScenariosQueryDto } from "../dtos/get-admin-scenarios-query.dto";
import { AdminScenarioResponseDto, PaginatedAdminScenariosResponseDto } from "../dtos/admin-scenario-response.dto";
import { GetAdminSessionsQueryDto } from "../dtos/get-admin-sessions-query.dto";
import { PaginatedAdminSessionsResponseDto } from "../dtos/admin-session-list-item.dto";
import { AdminSessionDetailDto } from "../dtos/admin-session-detail.dto";
import { ScenePartnerAnalyticsDto } from "../dtos/scene-partner-analytics.dto";

export const SCENE_PARTNER_ADMIN_FACADE = "SCENE_PARTNER_ADMIN_FACADE";

export interface IScenePartnerAdminFacade {
    // Scenario Administration
    createScenario(dto: CreateScenarioDto): Promise<AdminScenarioResponseDto>;
    updateScenario(id: string, dto: UpdateScenarioDto): Promise<AdminScenarioResponseDto>;
    toggleScenarioStatus(id: string, dto: ToggleScenarioStatusDto): Promise<AdminScenarioResponseDto>;
    getScenarios(query: GetAdminScenariosQueryDto): Promise<PaginatedAdminScenariosResponseDto>;
    getScenarioById(id: string): Promise<AdminScenarioResponseDto>;

    // Session Inspection & Audit Logs
    getSessions(query: GetAdminSessionsQueryDto): Promise<PaginatedAdminSessionsResponseDto>;
    getSessionDetails(sessionId: string): Promise<AdminSessionDetailDto>;

    // Platform Analytics
    getAnalytics(): Promise<ScenePartnerAnalyticsDto>;
}
