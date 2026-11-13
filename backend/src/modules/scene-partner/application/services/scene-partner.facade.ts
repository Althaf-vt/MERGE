import { Inject, Injectable } from "@nestjs/common";
import { IScenePartnerFacade } from "../interfaces/scene-partner-facade.interface";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";

@Injectable()
export class ScenePartnerFacade implements IScenePartnerFacade {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async getActiveSessionForUser(userId: string): Promise<SceneSessionResponseDto | null> {
        const session = await this._sessionRepository.findActiveByUserId(userId);
        if (!session) return null;
        return SceneSessionDtoMapper.toResponseDto(session);
    }

    async getSessionById(sessionId: string): Promise<SceneSessionResponseDto | null> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) return null;
        return SceneSessionDtoMapper.toResponseDto(session);
    }

    async getUserSessions(userId: string, limit: number = 20, skip: number = 0): Promise<PaginatedSceneSessionsResponseDto> {
        const result = await this._sessionRepository.findAllByUserId(userId, limit, skip);
        return SceneSessionDtoMapper.toPaginatedResponseDto(result);
    }

    async getUserSessionCount(userId: string): Promise<number> {
        const result = await this._sessionRepository.findAllByUserId(userId, 1, 0);
        return result.total;
    }
}

