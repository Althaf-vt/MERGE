import { Inject, Injectable } from "@nestjs/common";
import { END_SCENE_SESSION_USE_CASE, IEndSceneSessionUseCase, ISendSceneTurnUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { SendSceneTurnDto } from "../dtos/send-scene-turn.dto";
import { SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { IScenePartnerAiService, SCENE_PARTNER_AI_SERVICE } from "../../domain/interfaces/scene-partner-ai.interface";
import { IUserContextFacade, USER_CONTEXT_FACADE } from "../interfaces/user-context-facade.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";
import { PREDEFINED_SCENARIOS } from "../../domain/constants/predefined-scenarios.constant";
import { Scenario } from "../../domain/entities/scenario.entity";
import { ScenarioCategory } from "../../domain/enums/scene-partner.enums";
import { CoachNoteVO } from "../../domain/value-objects/coach-note.vo";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class SendSceneTurnUseCase implements ISendSceneTurnUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
        @Inject(SCENE_PARTNER_AI_SERVICE) private readonly _aiService: IScenePartnerAiService,
        @Inject(USER_CONTEXT_FACADE) private readonly _userContextFacade: IUserContextFacade,
        @Inject(END_SCENE_SESSION_USE_CASE) private readonly _endSceneSessionUseCase: IEndSceneSessionUseCase,
    ) { }

    async execute(userId: string, sessionId: string, dto: SendSceneTurnDto): Promise<SceneSessionResponseDto> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SESSION_NOT_FOUND);
        }

        // Automatic Conclusion Guard: If session duration has exceeded its limit, automatically end and debrief
        if (session.isDurationExceeded()) {
            return await this._endSceneSessionUseCase.execute(userId, sessionId);
        }

        // Snapshot prior conversation history before appending new user turn
        const priorTranscript = session.toJSON().transcript;

        session.addUserTurn(userId, dto.content);

        // Resolve Scenario for Context
        let scenario = PREDEFINED_SCENARIOS.find((s) => s.id === session.scenarioId);
        if (!scenario) {
            const promptContext = session.scenarioPromptContext || session.scenarioTitle;
            scenario = session.scenarioCategory === ScenarioCategory.CUSTOM
                ? Scenario.createCustom({
                    id: session.scenarioId,
                    title: session.scenarioTitle,
                    description: promptContext,
                    promptContext,
                    creatorUserId: session.userId,
                })
                : Scenario.createPredefined({
                    id: session.scenarioId,
                    title: session.scenarioTitle,
                    description: session.scenarioTitle,
                    category: session.scenarioCategory,
                    promptContext,
                });
        }

        // Build Simulation Context
        const simulationContext = await this._userContextFacade.buildSimulationContext(
            userId,
            scenario,
            session.simulationType,
            session.targetUserId,
        );

        // Execute AI Turn (Concurrent Dual-Agent if coaching enabled, persona-only if disabled)
        const { personaReply, coachNote } = await this._aiService.generateTurn(
            simulationContext,
            dto.content,
            priorTranscript,
            session.isCoachingEnabled,
        );

        // Reconstitute CoachNote VO if intervention occurred 
        const coachNoteVO = coachNote ? CoachNoteVO.create(coachNote) : null;

        session.addSimulationTurn(personaReply, coachNoteVO);

        const updatedSession = await this._sessionRepository.update(session);
        return SceneSessionDtoMapper.toResponseDto(updatedSession);
    }
}

