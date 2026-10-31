import { PrivateListAggregate } from "../../domain/entities/private-list.entity";
import { PrivateListResponseDto } from "../dtos/private-list.dto";
import { PublicProfileDto } from "../../../users/application/interfaces/public-profile-facade.interface";

export class PrivateListDtoMapper {
    public static toResponseDto(
        entry: PrivateListAggregate,
        targetProfile: PublicProfileDto | null,
        presignedPhotoUrl: string | null
    ): PrivateListResponseDto {
        return {
            id: entry.id,
            targetUserId: entry.targetUserId,
            targetName: targetProfile?.displayName ?? 'Unknown',
            targetPhotoUrl: presignedPhotoUrl,
            listType: entry.listType,
            createdAt: entry.createdAt,
        };
    }
}