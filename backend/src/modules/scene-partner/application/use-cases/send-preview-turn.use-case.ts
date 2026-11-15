import { Inject, Injectable } from "@nestjs/common";
import { IPreviewContextBuilder, ISendPreviewTurnUseCase, PREVIEW_CONTEXT_BUILDER } from "../interfaces/scene-partner-preview.use-cases.interface";
import { ScenePreviewResponseDto, SendScenePreviewTurnDto } from "../dtos/preview-session.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { IScenePartnerAiService, SCENE_PARTNER_AI_SERVICE } from "../../domain/interfaces/scene-partner-ai.interface";
import { CoachNoteVO } from "../../domain/value-objects/coach-note.vo";
import { ScenePreviewDtoMapper } from "../mappers/scene-preview-dto.mapper";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class SendPreviewTurnUseCase implements ISendPreviewTurnUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
        @Inject(SCENE_PARTNER_AI_SERVICE) private readonly _aiService: IScenePartnerAiService,
        @Inject(PREVIEW_CONTEXT_BUILDER) private readonly _contextBuilder: IPreviewContextBuilder,
    ) { }

    async execute(adminId: string, sessionId: string, dto: SendScenePreviewTurnDto): Promise<ScenePreviewResponseDto> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.PREVIEW_SESSION_NOT_FOUND);
        }

        if (!session.isPreview) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.NOT_PREVIEW_SESSION);
        }

        const priorTranscript = session.toJSON().transcript;

        // Append Admin Test Message to Aggregate
        session.addUserTurn(adminId, dto.content);

        // Build Sandbox Simulation Context
        const simulationContext = this._contextBuilder.build({
            scenarioTitle: session.scenarioTitle,
            scenarioCategory: session.scenarioCategory,
            promptContext: session.scenarioPromptContext || session.scenarioTitle,
            adminName: "Admin Reviewer",
        });

        const { personaReply, coachNote } = await this._aiService.generateTurn(
            simulationContext,
            dto.content,
            priorTranscript,
            session.isCoachingEnabled,
        );

        const coachNoteVO = coachNote ? CoachNoteVO.create(coachNote) : null;

        session.addSimulationTurn(personaReply, coachNoteVO);

        const updatedSession = await this._sessionRepository.update(session);
        return ScenePreviewDtoMapper.toResponseDto(updatedSession);
    }
}
