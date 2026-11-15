import { Inject, Injectable } from "@nestjs/common";
import { IGetScenePartnerAnalyticsUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { ScenePartnerAnalyticsDto } from "../dtos/scene-partner-analytics.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";

@Injectable()
export class GetScenePartnerAnalyticsUseCase implements IGetScenePartnerAnalyticsUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async execute(): Promise<ScenePartnerAnalyticsDto> {
        const raw = await this._sessionRepository.getAnalytics();
        return SceneSessionDtoMapper.toAnalyticsDto(raw);
    }
}
