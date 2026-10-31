import { Inject, Injectable } from "@nestjs/common";
import { IGetPrivateListUseCase } from "../interfaces/private-list.use-cases.interface";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { GetPrivateListQueryDto, PaginatedPrivateListResponseDto } from "../dtos/private-list.dto";
import { IPublicProfileFacade, PUBLIC_PROFILE_FACADE } from "../../../users/application/interfaces/public-profile-facade.interface";
import { IMediaFacade, MEDIA_FACADE } from "../../../users/application/interfaces/media-facade.interface";
import { CONNECTION_CONSTANTS } from "../../domain/constants/connection.constants";

@Injectable()
export class GetPrivateListUseCase implements IGetPrivateListUseCase {
    constructor(
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _listRepo: IPrivateListRepository,
        @Inject(PUBLIC_PROFILE_FACADE) private readonly _publicProfileFacade: IPublicProfileFacade,
        @Inject(MEDIA_FACADE) private readonly _mediaFacade: IMediaFacade,
    ) {}

    async execute(userId: string, query: GetPrivateListQueryDto): Promise<PaginatedPrivateListResponseDto> {
        const page = query.page ?? CONNECTION_CONSTANTS.PAGINATION.DEFAULT_PAGE;
        const limit = query.limit ?? CONNECTION_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

        const paginatedResult = await this._listRepo.getPaginatedList(userId, query.listType, page, limit);

        const hydratedData = await Promise.all(
            paginatedResult.data.map(async (entry) => {
                const targetProfile = await this._publicProfileFacade.getPublicProfile(entry.targetUserId);
                
                let targetPhotoUrl = targetProfile?.profilePhotoUrl ?? null;
                if (targetPhotoUrl) {
                    targetPhotoUrl = await this._mediaFacade.getPresignedMediaUrl(targetPhotoUrl) || targetPhotoUrl;
                }

                return {
                    id: entry.id,
                    targetUserId: entry.targetUserId,
                    targetName: targetProfile?.displayName ?? 'Unknown',
                    targetPhotoUrl: targetPhotoUrl,
                    listType: entry.listType,
                    createdAt: entry.createdAt,
                };
            })
        );

        return {
            data: hydratedData,
            total: paginatedResult.total,
            page,
            limit
        };
    }
}