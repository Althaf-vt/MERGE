import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../users/users.module";
import { SceneSessionSchema, SceneSessionSchemaClass } from "./infrastructure/persistence/scene-session.schema";
import { ScenarioSchema, ScenarioSchemaClass } from "./infrastructure/persistence/scenario.schema";
import { ScenePartnerController } from "./presentation/controllers/scene-partner.controller";
import { SCENE_SESSION_REPOSITORY } from "./domain/interfaces/scene-session-repository.interface";
import { MongoSceneSessionRepository } from "./infrastructure/persistence/mongo-scene-session.repository";
import { SCENARIO_REPOSITORY } from "./domain/interfaces/scenario-repository.interface";
import { MongoScenarioRepository } from "./infrastructure/persistence/mongo-scenario.repository";
import { ScenarioSeederService } from "./infrastructure/services/scenario-seeder.service";
import { SCENE_PARTNER_AI_SERVICE } from "./domain/interfaces/scene-partner-ai.interface";
import { OpenRouterScenePartnerAiService } from "./infrastructure/services/openrouter-scene-partner-ai.service";
import { SCENE_PARTNER_SUBSCRIPTION_FACADE } from "./application/interfaces/scene-partner-subscription-facade.interface";
import { MockSubscriptionFacade } from "./infrastructure/adapters/mock-subscription.facade";
import { USER_CONTEXT_FACADE } from "./application/interfaces/user-context-facade.interface";
import { UserContextAdapter } from "./infrastructure/adapters/user-context.adapter";
import { DELETE_SCENE_SESSION_USE_CASE, END_SCENE_SESSION_USE_CASE, GET_ACTIVE_SCENE_SESSION_USE_CASE, GET_SCENARIOS_USE_CASE, GET_SCENE_SESSION_BY_ID_USE_CASE, GET_SCENE_SESSION_HISTORY_USE_CASE, PAUSE_SCENE_SESSION_USE_CASE, RESUME_SCENE_SESSION_USE_CASE, SEND_SCENE_TURN_USE_CASE, START_SCENE_SESSION_USE_CASE, UPDATE_COACHING_MODE_USE_CASE, } from "./application/interfaces/scene-partner.use-cases.interface";
import { DeleteSceneSessionUseCase } from "./application/use-cases/delete-scene-session.use-case";
import { UpdateCoachingModeUseCase } from "./application/use-cases/update-coaching-mode.use-case";
import { StartSceneSessionUseCase } from "./application/use-cases/start-scene-session.use-case";
import { SendSceneTurnUseCase } from "./application/use-cases/send-scene-turn.use-case";
import { PauseSceneSessionUseCase } from "./application/use-cases/pause-scene-session.use-case";
import { ResumeSceneSessionUseCase } from "./application/use-cases/resume-scene-session.use-case";
import { EndSceneSessionUseCase } from "./application/use-cases/end-scene-session.use-case";
import { GetActiveSceneSessionUseCase } from "./application/use-cases/get-active-scene-session.use-case";
import { GetSceneSessionByIdUseCase } from "./application/use-cases/get-scene-session-by-id.use-case";
import { GetSceneSessionHistoryUseCase } from "./application/use-cases/get-scene-session-history.use-case";
import { GetScenariosUseCase } from "./application/use-cases/get-scenarios.use-case";
import { SCENE_PARTNER_FACADE } from "./application/interfaces/scene-partner-facade.interface";
import { ScenePartnerFacade } from "./application/services/scene-partner.facade";
import { SCENE_PARTNER_ADMIN_FACADE } from "./application/interfaces/scene-partner-admin-facade.interface";
import { ScenePartnerAdminFacade } from "./application/services/scene-partner-admin.facade";
import {
    CREATE_SCENARIO_USE_CASE,
    GET_ADMIN_SCENARIO_BY_ID_USE_CASE,
    GET_ADMIN_SCENARIOS_USE_CASE,
    GET_ADMIN_SESSION_DETAILS_USE_CASE,
    GET_ADMIN_SESSIONS_USE_CASE,
    GET_SCENE_PARTNER_ANALYTICS_USE_CASE,
    TOGGLE_SCENARIO_STATUS_USE_CASE,
    UPDATE_SCENARIO_USE_CASE,
} from "./application/interfaces/scene-partner-admin.use-cases.interface";
import { CreateScenarioUseCase } from "./application/use-cases/create-scenario.use-case";
import { UpdateScenarioUseCase } from "./application/use-cases/update-scenario.use-case";
import { ToggleScenarioStatusUseCase } from "./application/use-cases/toggle-scenario-status.use-case";
import { GetAdminScenariosUseCase } from "./application/use-cases/get-admin-scenarios.use-case";
import { GetAdminScenarioByIdUseCase } from "./application/use-cases/get-admin-scenario-by-id.use-case";
import { GetAdminSessionsUseCase } from "./application/use-cases/get-admin-sessions.use-case";
import { GetAdminSessionDetailsUseCase } from "./application/use-cases/get-admin-session-details.use-case";
import { GetScenePartnerAnalyticsUseCase } from "./application/use-cases/get-scene-partner-analytics.use-case";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SceneSessionSchemaClass.name, schema: SceneSessionSchema },
            { name: ScenarioSchemaClass.name, schema: ScenarioSchema },
        ]),
        UserModule,
    ],
    controllers: [ScenePartnerController],
    providers: [
        { provide: SCENE_SESSION_REPOSITORY, useClass: MongoSceneSessionRepository },
        { provide: SCENARIO_REPOSITORY, useClass: MongoScenarioRepository },
        ScenarioSeederService,
        { provide: SCENE_PARTNER_AI_SERVICE, useClass: OpenRouterScenePartnerAiService },
        { provide: SCENE_PARTNER_SUBSCRIPTION_FACADE, useClass: MockSubscriptionFacade },
        { provide: USER_CONTEXT_FACADE, useClass: UserContextAdapter },
        { provide: START_SCENE_SESSION_USE_CASE, useClass: StartSceneSessionUseCase },
        { provide: SEND_SCENE_TURN_USE_CASE, useClass: SendSceneTurnUseCase },
        { provide: PAUSE_SCENE_SESSION_USE_CASE, useClass: PauseSceneSessionUseCase },
        { provide: RESUME_SCENE_SESSION_USE_CASE, useClass: ResumeSceneSessionUseCase },
        { provide: END_SCENE_SESSION_USE_CASE, useClass: EndSceneSessionUseCase },
        { provide: GET_ACTIVE_SCENE_SESSION_USE_CASE, useClass: GetActiveSceneSessionUseCase },
        { provide: GET_SCENE_SESSION_BY_ID_USE_CASE, useClass: GetSceneSessionByIdUseCase },
        { provide: GET_SCENE_SESSION_HISTORY_USE_CASE, useClass: GetSceneSessionHistoryUseCase },
        { provide: GET_SCENARIOS_USE_CASE, useClass: GetScenariosUseCase },
        { provide: DELETE_SCENE_SESSION_USE_CASE, useClass: DeleteSceneSessionUseCase },
        { provide: UPDATE_COACHING_MODE_USE_CASE, useClass: UpdateCoachingModeUseCase },
        // Scenario Admin Use Cases
        { provide: CREATE_SCENARIO_USE_CASE, useClass: CreateScenarioUseCase },
        { provide: UPDATE_SCENARIO_USE_CASE, useClass: UpdateScenarioUseCase },
        { provide: TOGGLE_SCENARIO_STATUS_USE_CASE, useClass: ToggleScenarioStatusUseCase },
        { provide: GET_ADMIN_SCENARIOS_USE_CASE, useClass: GetAdminScenariosUseCase },
        { provide: GET_ADMIN_SCENARIO_BY_ID_USE_CASE, useClass: GetAdminScenarioByIdUseCase },
        // Session Admin Use Cases
        { provide: GET_ADMIN_SESSIONS_USE_CASE, useClass: GetAdminSessionsUseCase },
        { provide: GET_ADMIN_SESSION_DETAILS_USE_CASE, useClass: GetAdminSessionDetailsUseCase },
        { provide: GET_SCENE_PARTNER_ANALYTICS_USE_CASE, useClass: GetScenePartnerAnalyticsUseCase },
        // Public Facades
        { provide: SCENE_PARTNER_FACADE, useClass: ScenePartnerFacade },
        { provide: SCENE_PARTNER_ADMIN_FACADE, useClass: ScenePartnerAdminFacade },
    ],
    exports: [
        SCENE_PARTNER_FACADE,
        SCENE_PARTNER_ADMIN_FACADE,
    ],
})
export class ScenePartnerModule { }
