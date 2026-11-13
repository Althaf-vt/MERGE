import { Inject, Injectable } from "@nestjs/common";
import { IGetActiveSceneSessionUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { SceneSessionResponseDto } from "../dtos/scene-session-response.dto";
import {
    ISceneSessionRepository,
    SCENE_SESSION_REPOSITORY,
} from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";

@Injectable()
export class GetActiveSceneSessionUseCase implements IGetActiveSceneSessionUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY)
        private readonly _sessionRepository: ISceneSessionRepository,
    ) {}

    async execute(userId: string): Promise<SceneSessionResponseDto | null> {
        const session = await this._sessionRepository.findActiveByUserId(userId);
        if (!session) {
            return null;
        }

        return SceneSessionDtoMapper.toResponseDto(session);
    }
}

