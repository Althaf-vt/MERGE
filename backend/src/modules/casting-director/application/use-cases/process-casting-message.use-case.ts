import { Inject, Injectable } from "@nestjs/common";
import { IProcessCastingMessageUseCase } from "../interfaces/process-casting-message.use-case.interface";
import { CASTING_SESSION_REPOSITORY, ICastingSessionRepository } from "../../domain/interfaces/casting-session-repository.interface";
import { CASTING_USER_FACADE, IcastingUserFacade } from "../interfaces/casting-user-facade.interface";
import { CASTING_AI_SERVICE, ICastingAiService } from "../../domain/interfaces/casting-ai-service.interface";
import { CastingSession } from "../../domain/entities/casting-session.entity";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class ProcessCastingMessageUseCase implements IProcessCastingMessageUseCase {
    constructor(
        @Inject(CASTING_SESSION_REPOSITORY) private readonly _sessionRepository: ICastingSessionRepository,
        @Inject(CASTING_USER_FACADE) private readonly _userFacade: IcastingUserFacade,
        @Inject(CASTING_AI_SERVICE) private readonly _aiService: ICastingAiService
    ) { }

    async execute(userId: string, content: string): Promise<CastingSession> {
        const session = await this._sessionRepository.findActiveSessionByUserId(userId);

        if (!session) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'No active casting session found. Please initialize first.');
        }

        // Update the domain aggregate
        session.addTurn('user', content);

        if (session.status === 'ANALYZING') {
            // The limit has been reached. Add a final closing remark before the client triggers finalization.
            session.addTurn('ai', 'Thank you for sharing all of that. I have everything I need to analyze your profile!');
            await this._sessionRepository.update(session);
            return session;
        }

        const userContext = await this._userFacade.getUserContextForCasting(userId);
        if (!userContext) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User context not found.');
        }

        // Call OpenRouter for the next question
        const followUp = await this._aiService.generateFollowUpQuestion(userContext, session.transcript);

        session.addTurn('ai', followUp);

        return await this._sessionRepository.update(session);
    }
}