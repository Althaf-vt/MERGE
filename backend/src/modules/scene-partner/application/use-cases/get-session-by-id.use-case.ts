import { Inject, Injectable } from "@nestjs/common";
import { IGetSessionByIdUseCase } from "../interfaces/get-session-by-id.use-case.interface";
import { SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";

@Injectable()
export class GetSessionByIdUseCase implements IGetSessionByIdUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async execute(sessionId: string): Promise<SceneSessionResponseDto | null> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            return null;
        }

        return SceneSessionDtoMapper.toResponseDto(session);
    }
}
