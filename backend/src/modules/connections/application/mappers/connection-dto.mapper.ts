import { ConnectionAggregate } from "../../domain/entities/connection.entity";
import { ConnectionResponseDto, PaginatedConnectionsResponseDto } from "../dtos/connection.dto";
import { IPublicProfileFacade, PublicProfileDto } from "../../../users/application/interfaces/public-profile-facade.interface";
import { IMediaFacade } from "../../../users/application/interfaces/media-facade.interface";
import { PaginatedConnectionsResult } from "../../domain/interfaces/connection-repository.interface";

export class ConnectionDtoMapper {
    public static toResponseDto(
        connection: ConnectionAggregate,
        currentUserId: string,
        partnerProfile: PublicProfileDto | null,
        presignedPhotoUrl: string | null
    ): ConnectionResponseDto {
        return {
            id: connection.id,
            partnerId: connection.getPartnerId(currentUserId),
            partnerName: partnerProfile?.displayName ?? 'Unknown',
            partnerPhotoUrl: presignedPhotoUrl,
            status: connection.status,
            createdAt: connection.createdAt,
            isRequester: connection.requesterId === currentUserId,
        };
    }

    public static async toHydratedResponseDto(
        connection: ConnectionAggregate,
        currentUserId: string,
        publicProfileFacade: IPublicProfileFacade,
        mediaFacade: IMediaFacade,
    ): Promise<ConnectionResponseDto> {
        const partnerId = connection.getPartnerId(currentUserId);
        const partnerProfile = await publicProfileFacade.getPublicProfile(partnerId);

        let partnerPhotoUrl = partnerProfile?.profilePhotoUrl ?? null;
        if (partnerPhotoUrl) {
            partnerPhotoUrl = await mediaFacade.getPresignedMediaUrl(partnerPhotoUrl) || partnerPhotoUrl;
        }

        return ConnectionDtoMapper.toResponseDto(connection, currentUserId, partnerProfile, partnerPhotoUrl);
    }

    public static async toHydratedResponseDtoList(
        connections: ConnectionAggregate[],
        currentUserId: string,
        publicProfileFacade: IPublicProfileFacade,
        mediaFacade: IMediaFacade,
    ): Promise<ConnectionResponseDto[]> {
        return Promise.all(
            connections.map((connection) =>
                ConnectionDtoMapper.toHydratedResponseDto(connection, currentUserId, publicProfileFacade, mediaFacade),
            ),
        );
    }

    public static async toPaginatedResponseDto(
        result: PaginatedConnectionsResult,
        page: number,
        limit: number,
        currentUserId: string,
        publicProfileFacade: IPublicProfileFacade,
        mediaFacade: IMediaFacade,
    ): Promise<PaginatedConnectionsResponseDto> {
        const data = await ConnectionDtoMapper.toHydratedResponseDtoList(
            result.data,
            currentUserId,
            publicProfileFacade,
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
