import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../users/users.module";
import { SceneSessionSchema, SceneSessionSchemaClass } from "./infrastructure/persistence/scene-session.schema";
import { ScenePartnerController } from "./presentation/controllers/scene-partner.controller";
import { SCENE_SESSION_REPOSITORY } from "./domain/interfaces/scene-session-repository.interface";
import { MongoSceneSessionRepository } from "./infrastructure/persistence/mongo-scene-session.repository";
import { SCENE_PARTNER_AI_SERVICE } from "./domain/interfaces/scene-partner-ai.interface";
import { OpenRouterScenePartnerAiService } from "./infrastructure/services/openrouter-scene-partner-ai.service";
import { SCENE_PARTNER_SUBSCRIPTION_FACADE } from "./application/interfaces/scene-partner-subscription-facade.interface";
import { MockSubscriptionFacade } from "./infrastructure/adapters/mock-subscription.facade";
import { USER_CONTEXT_FACADE } from "./application/interfaces/user-context-facade.interface";
import { UserContextAdapter } from "./infrastructure/adapters/user-context.adapter";
import { END_SCENE_SESSION_USE_CASE, GET_ACTIVE_SCENE_SESSION_USE_CASE, GET_SCENARIOS_USE_CASE, GET_SCENE_SESSION_BY_ID_USE_CASE, GET_SCENE_SESSION_HISTORY_USE_CASE, PAUSE_SCENE_SESSION_USE_CASE, RESUME_SCENE_SESSION_USE_CASE, SEND_SCENE_TURN_USE_CASE, START_SCENE_SESSION_USE_CASE, } from "./application/interfaces/scene-partner.use-cases.interface";
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

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SceneSessionSchemaClass.name, schema: SceneSessionSchema },
        ]),
        UserModule,
    ],
    controllers: [ScenePartnerController],
    providers: [
        { provide: SCENE_SESSION_REPOSITORY, useClass: MongoSceneSessionRepository },
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
        // Public Facade
        { provide: SCENE_PARTNER_FACADE, useClass: ScenePartnerFacade },
    ],
    exports: [
        // Rule 1 & Rule 5: Modules only export their public facade
        SCENE_PARTNER_FACADE,
    ],
})
export class ScenePartnerModule { }
