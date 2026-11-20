import { Inject, Injectable } from "@nestjs/common";
import { IScenePartnerFacade } from "../interfaces/scene-partner-facade.interface";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { GET_ACTIVE_SCENE_SESSION_USE_CASE, GET_SCENE_SESSION_HISTORY_USE_CASE, IGetActiveSceneSessionUseCase, IGetSceneSessionHistoryUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { GET_SESSION_BY_ID_USE_CASE, IGetSessionByIdUseCase } from "../interfaces/get-session-by-id.use-case.interface";

@Injectable()
export class ScenePartnerFacade implements IScenePartnerFacade {
    constructor(
        @Inject(GET_ACTIVE_SCENE_SESSION_USE_CASE) private readonly _getActiveSessionUseCase: IGetActiveSceneSessionUseCase,
        @Inject(GET_SESSION_BY_ID_USE_CASE) private readonly _getSessionByIdUseCase: IGetSessionByIdUseCase,
        @Inject(GET_SCENE_SESSION_HISTORY_USE_CASE) private readonly _getSessionHistoryUseCase: IGetSceneSessionHistoryUseCase,
    ) { }

    async getActiveSessionForUser(userId: string): Promise<SceneSessionResponseDto | null> {
        return this._getActiveSessionUseCase.execute(userId);
    }

    async getSessionById(sessionId: string): Promise<SceneSessionResponseDto | null> {
        return this._getSessionByIdUseCase.execute(sessionId);
    }

    async getUserSessions(userId: string, limit: number = 20, skip: number = 0): Promise<PaginatedSceneSessionsResponseDto> {
        return this._getSessionHistoryUseCase.execute(userId, limit, skip);
    }

    async getUserSessionCount(userId: string): Promise<number> {
        const result = await this._getSessionHistoryUseCase.execute(userId, 1, 0);
        return result.total;
    }
}
