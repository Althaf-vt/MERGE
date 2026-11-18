import { BlockedUserReadModel } from "../../domain/interfaces/blocked-relationship-repository.interface";
import { BlockedUserResponseDto } from "../dtos/block-management.dto";
import { IStorageService } from "../interfaces/storage-service.interface";

export class BlockedUserDtoMapper {
    public static toResponseDto(model: BlockedUserReadModel, secureAvatarUrl: string | null): BlockedUserResponseDto {
        let locationStr: string | undefined = undefined;
        if (model.city) {
            locationStr = `${model.city}${model.state ? `${model.state}` : ''}`;
        }

        return {
            blockedId: model.blockedId,
            displayName: model.isDeleted ? 'Account Deleted' : (model.displayName || 'Unknown Profile'),
            genderIdentity: model.genderIdentity || undefined,
            customLabel: model.customLabel || undefined,
            location: locationStr,
            avatarUrl: secureAvatarUrl,
            reason: model.reason,
            blockedAt: model.blockedAt,
            isDeleted: model.isDeleted,
        };
    }

    public static async toHydratedResponseDto(
        model: BlockedUserReadModel,
        storageService: IStorageService,
    ): Promise<BlockedUserResponseDto> {
        let secureAvatarUrl: string | null = null;
        if (model.avatarUrl) {
            secureAvatarUrl = await storageService.getPresignedUrl(model.avatarUrl, 900);
        }

        return BlockedUserDtoMapper.toResponseDto(model, secureAvatarUrl);
    }

    public static async toHydratedResponseDtoList(
        readModels: BlockedUserReadModel[],
        storageService: IStorageService,
    ): Promise<BlockedUserResponseDto[]> {
        return Promise.all(
            readModels.map((model) => BlockedUserDtoMapper.toHydratedResponseDto(model, storageService)),
        );
    }
}
