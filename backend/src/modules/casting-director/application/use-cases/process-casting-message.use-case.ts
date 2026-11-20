import { Inject, Injectable } from "@nestjs/common";
import { IProcessCastingMessageUseCase } from "../interfaces/process-casting-message.use-case.interface";
import { CASTING_SESSION_REPOSITORY, ICastingSessionRepository } from "../../domain/interfaces/casting-session-repository.interface";
import { CASTING_USER_FACADE, IcastingUserFacade } from "../../../users/application/interfaces/casting-user-facade.interface";
import { CASTING_AI_SERVICE, ICastingAiService } from "../../domain/interfaces/casting-ai-service.interface";
import { CastingSessionStatus, TranscriptRole } from "../../domain/enums/casting.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { CASTING_ERROR_MESSAGES } from "../../domain/constants/casting-error-messages.constant";
import { CASTING_SESSION_DIALOGUE } from "../../domain/constants/casting-session.constant";
import { CastingSessionResponseDto } from "../dtos/casting-session-response.dto";
import { CastingSessionDtoMapper } from "../mappers/casting-session-dto.mapper";

@Injectable()
export class ProcessCastingMessageUseCase implements IProcessCastingMessageUseCase {
    constructor(
        @Inject(CASTING_SESSION_REPOSITORY) private readonly _sessionRepository: ICastingSessionRepository,
        @Inject(CASTING_USER_FACADE) private readonly _userFacade: IcastingUserFacade,
        @Inject(CASTING_AI_SERVICE) private readonly _aiService: ICastingAiService
    ) { }

    async execute(userId: string, content: string): Promise<CastingSessionResponseDto> {
        const session = await this._sessionRepository.findActiveSessionByUserId(userId);

        if (!session) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CASTING_ERROR_MESSAGES.NO_ACTIVE_SESSION_INITIALIZE);
        }

        // Update the domain aggregate
        session.addTurn(TranscriptRole.USER, content);

        if (session.status === CastingSessionStatus.ANALYZING) {
            // The limit has been reached. Add a final closing remark before the client triggers finalization.
            session.addTurn(TranscriptRole.AI, CASTING_SESSION_DIALOGUE.CLOSING_REMARK);
            await this._sessionRepository.update(session);
            return CastingSessionDtoMapper.toResponseDto(session);
        }

        const userContext = await this._userFacade.getUserContextForCasting(userId);
        if (!userContext) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, CASTING_ERROR_MESSAGES.USER_CONTEXT_NOT_FOUND);
        }

        // Call OpenRouter for the next question
        const followUp = await this._aiService.generateFollowUpQuestion(userContext, session.transcript);

        session.addTurn(TranscriptRole.AI, followUp);

        await this._sessionRepository.update(session);

        return CastingSessionDtoMapper.toResponseDto(session)
    }
}