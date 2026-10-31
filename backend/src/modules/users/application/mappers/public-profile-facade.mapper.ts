import { UserAggregate } from "../../domain/entities/user.entity";
import { PublicProfileDto } from "../interfaces/public-profile-facade.interface";

export class PublicProfileFacadeMapper {
    public static toDto(user: UserAggregate): PublicProfileDto {
        const photos = user.photos || [];
        const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
        return {
            id: user.id as string,
            displayName: user.profile?.displayName ?? 'Unknown',
            profilePhotoUrl: primaryPhoto?.url ?? null,
        };
    }
}