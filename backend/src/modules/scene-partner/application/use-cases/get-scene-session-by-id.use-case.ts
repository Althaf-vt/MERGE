import { Inject, Injectable } from "@nestjs/common";
import { IGetSceneSessionByIdUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class GetSceneSessionByIdUseCase implements IGetSceneSessionByIdUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async execute(userId: string, sessionId: string): Promise<SceneSessionResponseDto> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SESSION_NOT_FOUND);
        }

        if (!session.isOwner(userId)) {
            throw new DomainException(ErrorCode.FORBIDDEN, SCENE_PARTNER_ERROR_MESSAGES.NOT_SESSION_OWNER);
        }

        return SceneSessionDtoMapper.toResponseDto(session);
    }
}

