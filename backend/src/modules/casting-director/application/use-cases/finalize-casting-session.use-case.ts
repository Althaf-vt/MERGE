import { Inject, Injectable } from "@nestjs/common";
import { IFinalizeCastingSessionUseCase } from "../interfaces/finalize-casting-session.use-case.interface";
import { CASTING_SESSION_REPOSITORY, ICastingSessionRepository } from "../../domain/interfaces/casting-session-repository.interface";
import { CASTING_USER_FACADE, IcastingUserFacade } from "../../../users/application/interfaces/casting-user-facade.interface";
import { CASTING_AI_SERVICE, ICastingAiService } from "../../domain/interfaces/casting-ai-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class FinalizeCastingSessionUseCase implements IFinalizeCastingSessionUseCase{
    constructor(
        @Inject(CASTING_SESSION_REPOSITORY) private readonly _sessionRepository: ICastingSessionRepository,
        @Inject(CASTING_USER_FACADE) private readonly _userFacade: IcastingUserFacade,
        @Inject(CASTING_AI_SERVICE) private readonly _aiService: ICastingAiService
    ){}

    async execute(userId: string): Promise<void> {
        const session = await this._sessionRepository.findActiveSessionByUserId(userId);

        if(!session){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'No active casting session found to finalize.');
        }

        if(session.status !== 'ANALYZING'){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Session has not reached the required turns to finalize.');
        }

        const userContext = await this._userFacade.getUserContextForCasting(userId);
        if(!userContext){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User context not found.');
        }

        // Trigger OpenRouter for the summary and vector embeddings
        const {aiSummary, personalityVector} = await this._aiService.extractSummaryAndVector(userContext, session.transcript);
        
        // Transition domain aggregate to final state
        session.completeSession(personalityVector, aiSummary);

        await this._sessionRepository.update(session);

        // Delegate the vector storate back to the isolated User module
        await this._userFacade.markCastingComplete(userId, personalityVector);
    }
}