import { ConnectionAggregate } from "../../domain/entities/connection.entity";
import { ConnectionResponseDto } from "../dtos/connection.dto";
import { PublicProfileDto } from "../../../users/application/interfaces/public-profile-facade.interface";

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
            isPriority: connection.isPriority,
            icebreakerMessage: connection.icebreakerMessage,
            createdAt: connection.createdAt,
            isRequester: connection.requesterId === currentUserId,
        };
    }
}