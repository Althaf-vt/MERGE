import { Inject, Injectable } from "@nestjs/common";
import { IEndSceneSessionUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { IScenePartnerAiService, SCENE_PARTNER_AI_SERVICE } from "../../domain/interfaces/scene-partner-ai.interface";
import { IUserContextFacade, USER_CONTEXT_FACADE } from "../interfaces/user-context-facade.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";
import { PREDEFINED_SCENARIOS } from "../../domain/constants/predefined-scenarios.constant";
import { Scenario } from "../../domain/entities/scenario.entity";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { SceneSessionStatus } from "../../domain/enums/scene-partner.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class EndSceneSessionUseCase implements IEndSceneSessionUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
        @Inject(SCENE_PARTNER_AI_SERVICE) private readonly _aiService: IScenePartnerAiService,
        @Inject(USER_CONTEXT_FACADE) private readonly _userContextFacade: IUserContextFacade,
    ) { }

    async execute(userId: string, sessionId: string): Promise<SceneSessionResponseDto> {
        // 1. Fetch Session
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            throw new DomainException(
                ErrorCode.USER_NOT_FOUND,
                SCENE_PARTNER_ERROR_MESSAGES.SESSION_NOT_FOUND,
            );
        }

        // 2. Assert Ownership
        if (!session.isOwner(userId)) {
            throw new DomainException(
                ErrorCode.FORBIDDEN,
                SCENE_PARTNER_ERROR_MESSAGES.NOT_SESSION_OWNER,
            );
        }

        // 3. Ensure Session is Not Already Completed
        if (session.status === SceneSessionStatus.COMPLETED) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                SCENE_PARTNER_ERROR_MESSAGES.INVALID_STATUS_FOR_COMPLETE,
            );
        }

        // 4. Resolve Scenario for Context Debrief
        let scenario = PREDEFINED_SCENARIOS.find((s) => s.id === session.scenarioId);
        if (!scenario) {
            scenario = Scenario.createPredefined({
                id: session.scenarioId,
                title: session.scenarioTitle,
                description: session.scenarioTitle,
                category: session.scenarioCategory,
                promptContext: session.scenarioTitle,
            });
        }

        // 5. Build Simulation Context
        const simulationContext = await this._userContextFacade.buildSimulationContext(
            userId,
            scenario,
            session.simulationType,
            session.targetUserId,
        );

        // 6. Generate Debrief and Evaluation via AI Coach
        const summary = await this._aiService.generateSessionSummary(
            simulationContext,
            session.toJSON().transcript,
        );

        // 7. Transition Aggregate Root to COMPLETED
        session.complete(userId, summary);

        // 8. Persist and Map Response
        const updatedSession = await this._sessionRepository.update(session);
        return SceneSessionDtoMapper.toResponseDto(updatedSession);
    }
}

