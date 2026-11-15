import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminSessionsUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { GetAdminSessionsQueryDto } from "../dtos/get-admin-sessions-query.dto";
import { PaginatedAdminSessionsResponseDto } from "../dtos/admin-session-list-item.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";

@Injectable()
export class GetAdminSessionsUseCase implements IGetAdminSessionsUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async execute(query: GetAdminSessionsQueryDto): Promise<PaginatedAdminSessionsResponseDto> {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.max(1, query.limit ?? 20);
        const skip = (page - 1) * limit;

        const result = await this._sessionRepository.findAdminSessions({
            userId: query.userId,
            scenarioId: query.scenarioId,
            simulationType: query.simulationType,
            status: query.status,
            startDate: query.startDate,
            endDate: query.endDate,
            limit,
            skip,
        });

        return {
            data: SceneSessionDtoMapper.toAdminListItemDtoList(result.data),
            total: result.total,
            page,
            limit,
        };
    }
}
