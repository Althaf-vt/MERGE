import { Inject, Injectable } from "@nestjs/common";
import { IStartSceneSessionUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { StartSceneSessionDto } from "../dtos/start-scene-session.dto";
import { SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { IScenePartnerAiService, SCENE_PARTNER_AI_SERVICE } from "../../domain/interfaces/scene-partner-ai.interface";
import { IScenePartnerSubscriptionFacade, SCENE_PARTNER_SUBSCRIPTION_FACADE } from "../interfaces/scene-partner-subscription-facade.interface";
import { IUserContextFacade, USER_CONTEXT_FACADE } from "../interfaces/user-context-facade.interface";
import { SceneSession } from "../../domain/entities/scene-session.entity";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";
import { PREDEFINED_SCENARIOS } from "../../domain/constants/predefined-scenarios.constant";
import { SCENE_PARTNER_ERROR_MESSAGES, SCENE_PARTNER_POLICY } from "../../domain/constants/scene-partner.constants";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class StartSceneSessionUseCase implements IStartSceneSessionUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
        @Inject(SCENE_PARTNER_AI_SERVICE) private readonly _aiService: IScenePartnerAiService,
        @Inject(SCENE_PARTNER_SUBSCRIPTION_FACADE) private readonly _subscriptionFacade: IScenePartnerSubscriptionFacade,
        @Inject(USER_CONTEXT_FACADE) private readonly _userContextFacade: IUserContextFacade,
    ) { }

    async execute(userId: string, dto: StartSceneSessionDto): Promise<SceneSessionResponseDto> {
        // 1. Subscription Check (Premium Feature Gating)
        const isEntitled = await this._subscriptionFacade.canStartSession(userId);
        if (!isEntitled) {
            throw new DomainException(
                ErrorCode.FORBIDDEN,
                SCENE_PARTNER_ERROR_MESSAGES.SUBSCRIPTION_REQUIRED,
            );
        }

        // 2. Active Session Restriction (Single Active Session at a Time)
        const existingActiveSession = await this._sessionRepository.findActiveByUserId(userId);
        if (existingActiveSession) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                SCENE_PARTNER_ERROR_MESSAGES.ACTIVE_SESSION_EXISTS,
            );
        }

        // 3. Resolve Scenario
        const scenario = PREDEFINED_SCENARIOS.find((s) => s.id === dto.scenarioId);
        if (!scenario) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_REQUIRED,
            );
        }

        // 4. Resolve Simulation Context (User & Match Profiles)
        const simulationContext = await this._userContextFacade.buildSimulationContext(
            userId,
            scenario,
            dto.simulationType,
            dto.targetUserId,
        );

        // 5. Generate Opening Partner Greeting via AI
        const openingGreeting = await this._aiService.generateInitialGreeting(simulationContext);

        // 6. Create Aggregate Root & Transition Lifecycle
        const session = SceneSession.create({
            userId,
            simulationType: dto.simulationType,
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            scenarioCategory: scenario.category,
            targetUserId: dto.targetUserId,
            maxDurationMinutes: SCENE_PARTNER_POLICY.DEFAULT_MAX_DURATION_MINUTES,
        });

        session.startSession(openingGreeting);

        // 7. Persist and Map Response
        const savedSession = await this._sessionRepository.create(session);
        return SceneSessionDtoMapper.toResponseDto(savedSession);
    }
}

