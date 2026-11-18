import { PrivateListAggregate } from "../../domain/entities/private-list.entity";
import { PaginatedPrivateListResponseDto, PrivateListResponseDto } from "../dtos/private-list.dto";
import { IPublicProfileFacade, PublicProfileDto } from "../../../users/application/interfaces/public-profile-facade.interface";
import { IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { IMediaFacade } from "../../../users/application/interfaces/media-facade.interface";

export class PrivateListDtoMapper {
    public static toResponseDto(
        entry: PrivateListAggregate,
        targetProfile: PublicProfileDto | null,
        presignedPhotoUrl: string | null,
        hasPendingConnectionRequest: boolean,
        hasIncomingConnectionRequest: boolean = false
    ): PrivateListResponseDto {
        return {
            id: entry.id,
            targetUserId: entry.targetUserId,
            targetName: targetProfile?.displayName ?? 'Unknown',
            targetPhotoUrl: presignedPhotoUrl,
            listType: entry.listType,
            createdAt: entry.createdAt,
            hasPendingConnectionRequest,
            hasIncomingConnectionRequest,
        };
    }

    public static async toHydratedResponseDto(
        entry: PrivateListAggregate,
        currentUserId: string,
        publicProfileFacade: IPublicProfileFacade,
        connectionRepo: IConnectionRepository,
        mediaFacade: IMediaFacade,
    ): Promise<PrivateListResponseDto> {
        const [targetProfile, outgoingRequest, incomingRequest] = await Promise.all([
            publicProfileFacade.getPublicProfile(entry.targetUserId),
            connectionRepo.findPendingRequest(currentUserId, entry.targetUserId),
            connectionRepo.findPendingRequest(entry.targetUserId, currentUserId),
        ]);

        let targetPhotoUrl = targetProfile?.profilePhotoUrl ?? null;
        if (targetPhotoUrl) {
            targetPhotoUrl = await mediaFacade.getPresignedMediaUrl(targetPhotoUrl) || targetPhotoUrl;
        }

        const hasPendingConnectionRequest = Boolean(outgoingRequest);
        const hasIncomingConnectionRequest = Boolean(incomingRequest);

        return PrivateListDtoMapper.toResponseDto(
            entry,
            targetProfile,
            targetPhotoUrl,
            hasPendingConnectionRequest,
            hasIncomingConnectionRequest,
        );
    }

    public static async toHydratedResponseDtoList(
        entries: PrivateListAggregate[],
        currentUserId: string,
        publicProfileFacade: IPublicProfileFacade,
        connectionRepo: IConnectionRepository,
        mediaFacade: IMediaFacade,
    ): Promise<PrivateListResponseDto[]> {
        return Promise.all(
            entries.map((entry) =>
                PrivateListDtoMapper.toHydratedResponseDto(
                    entry,
                    currentUserId,
                    publicProfileFacade,
                    connectionRepo,
                    mediaFacade,
                ),
            ),
        );
    }

    public static async toPaginatedResponseDto(
        result: { data: PrivateListAggregate[]; total: number },
        page: number,
        limit: number,
        currentUserId: string,
        publicProfileFacade: IPublicProfileFacade,
        connectionRepo: IConnectionRepository,
        mediaFacade: IMediaFacade,
    ): Promise<PaginatedPrivateListResponseDto> {
        const data = await PrivateListDtoMapper.toHydratedResponseDtoList(
            result.data,
            currentUserId,
            publicProfileFacade,
            connectionRepo,
            mediaFacade,
        );

        return {
            data,
            total: result.total,
            page,
            limit,
        };
    }
}
