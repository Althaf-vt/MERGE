import { Inject, Injectable } from "@nestjs/common";
import { IGetSceneSessionHistoryUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class GetSceneSessionHistoryUseCase implements IGetSceneSessionHistoryUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async getSessionById(userId: string, sessionId: string): Promise<SceneSessionResponseDto> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            throw new DomainException(
                ErrorCode.USER_NOT_FOUND,
                SCENE_PARTNER_ERROR_MESSAGES.SESSION_NOT_FOUND,
            );
        }

        if (!session.isOwner(userId)) {
            throw new DomainException(
                ErrorCode.FORBIDDEN,
                SCENE_PARTNER_ERROR_MESSAGES.NOT_SESSION_OWNER,
            );
        }

        return SceneSessionDtoMapper.toResponseDto(session);
    }

    async getActiveSession(userId: string): Promise<SceneSessionResponseDto | null> {
        const session = await this._sessionRepository.findActiveByUserId(userId);
        if (!session) {
            return null;
        }

        return SceneSessionDtoMapper.toResponseDto(session);
    }

    async getUserHistory(
        userId: string,
        limit: number = 20,
        skip: number = 0,
    ): Promise<PaginatedSceneSessionsResponseDto> {
        const result = await this._sessionRepository.findAllByUserId(userId, limit, skip);
        return SceneSessionDtoMapper.toPaginatedResponseDto(result);
    }
}

