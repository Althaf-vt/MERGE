import { Inject, Injectable } from "@nestjs/common";
import { IDeleteSceneSessionUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class DeleteSceneSessionUseCase implements IDeleteSceneSessionUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY)
        private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async execute(userId: string, sessionId: string): Promise<{ success: boolean; id: string }> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SESSION_NOT_FOUND);
        }

        if (!session.isOwner(userId)) {
            throw new DomainException(ErrorCode.FORBIDDEN, SCENE_PARTNER_ERROR_MESSAGES.NOT_SESSION_OWNER);
        }

        const deleted = await this._sessionRepository.deleteById(sessionId, userId);
        if (!deleted) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SESSION_NOT_FOUND);
        }

        return { success: true, id: sessionId };
    }
}
