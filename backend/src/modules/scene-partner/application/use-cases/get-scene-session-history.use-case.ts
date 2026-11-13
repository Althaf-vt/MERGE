import { Inject, Injectable } from "@nestjs/common";
import { IGetSceneSessionHistoryUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { PaginatedSceneSessionsResponseDto } from "../dtos/scene-session-response.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";

@Injectable()
export class GetSceneSessionHistoryUseCase implements IGetSceneSessionHistoryUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async execute(userId: string, limit: number = 20, skip: number = 0): Promise<PaginatedSceneSessionsResponseDto> {
        const result = await this._sessionRepository.findAllByUserId(userId, limit, skip);
        return SceneSessionDtoMapper.toPaginatedResponseDto(result);
    }
}
