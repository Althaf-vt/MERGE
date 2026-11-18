import { Inject, Injectable } from "@nestjs/common";
import { IGetConnectionsUseCase } from "../interfaces/connection.use-cases.interface";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { GetConnectionsQueryDto, PaginatedConnectionsResponseDto } from "../dtos/connection.dto";
import { IPublicProfileFacade, PUBLIC_PROFILE_FACADE } from "../../../users/application/interfaces/public-profile-facade.interface";
import { IMediaFacade, MEDIA_FACADE } from "../../../users/application/interfaces/media-facade.interface";
import { CONNECTION_CONSTANTS } from "../../domain/constants/connection.constants";
import { ConnectionDtoMapper } from "../mappers/connection-dto.mapper";

@Injectable()
export class GetConnectionsUseCase implements IGetConnectionsUseCase {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository,
        @Inject(PUBLIC_PROFILE_FACADE) private readonly _publicProfileFacade: IPublicProfileFacade,
        @Inject(MEDIA_FACADE) private readonly _mediaFacade: IMediaFacade,
    ) {}

    async execute(userId: string, query: GetConnectionsQueryDto): Promise<PaginatedConnectionsResponseDto> {
        const page = query.page ?? CONNECTION_CONSTANTS.PAGINATION.DEFAULT_PAGE;
        const limit = query.limit ?? CONNECTION_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

        const paginatedResult = await this._connectionRepo.getPaginatedByStatus({
            userId,
            statuses: query.status,
            role: query.role,
            page,
            limit
        });

        return ConnectionDtoMapper.toPaginatedResponseDto(
            paginatedResult,
            page,
            limit,
            userId,
            this._publicProfileFacade,
            this._mediaFacade,
        );
    }
}
