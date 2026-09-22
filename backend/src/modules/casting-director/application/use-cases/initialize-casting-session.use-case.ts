import { Inject, Injectable } from "@nestjs/common";
import { IInitializeCastingSessionUseCase } from "../interfaces/initialize-casting-session.use-case.interface";
import { CASTING_SESSION_REPOSITORY, ICastingSessionRepository } from "../../domain/interfaces/casting-session-repository.interface";
import { CASTING_USER_FACADE, IcastingUserFacade } from "../interfaces/casting-user-facade.interface";
import { CASTING_AI_SERVICE, ICastingAiService } from "../../domain/interfaces/casting-ai-service.interface";
import { CastingSession } from "../../domain/entities/casting-session.entity";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class InitializeCastingSessionUseCase implements IInitializeCastingSessionUseCase {
    constructor(
        @Inject(CASTING_SESSION_REPOSITORY) private readonly _sessionRepository: ICastingSessionRepository,
        @Inject(CASTING_USER_FACADE) private readonly _userFacade: IcastingUserFacade,
        @Inject(CASTING_AI_SERVICE) private readonly _aiService: ICastingAiService
    ) { }

    async execute(userId: string): Promise<CastingSession> {
        // 1. prevent duplicate active sessions by returning the existing one if it is already IN_PROGRESS
        const existingSession = await this._sessionRepository.findActiveSessionByUserId(userId);
        if(existingSession){
            return existingSession;
        }

        // 2. Fetch user context across module boundaries using the isolated Facade
        const userContext = await this._userFacade.getUserContextForCasting(userId);
        if(!userContext){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "User context could not be found for casting.");
        }

        // 3. Generate the dynamic opening question via AI using the isolated context
        const openingQuestion = await this._aiService.generateOpeningQuestion(userContext);

        // 4. Initialize the domain entity
        const session = new CastingSession({
            userId,
            status: 'IN_PROGRESS',
            transcript: [],
            turnCount: 0
        });

        // 5. Add the AI's first turn to the transcript
        session.addTurn('ai', openingQuestion);

        // 6. Persist and return the new aggregate root
        return await this._sessionRepository.create(session);
    }
}