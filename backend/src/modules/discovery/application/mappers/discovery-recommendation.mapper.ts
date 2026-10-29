import { DiscoveryCandidateRaw, DiscoveryUserContext } from "../../domain/interfaces/discovery-repository.interface";
import { DiscoveryRecommendationDto } from "../dtos/discovery.dto";
import { GeoUtil } from "../../../../shared/domain/utils/geo.util";
import { DateUtil } from "../../../../shared/domain/utils/date.util";
import { IMediaFacade } from "../../../users/application/interfaces/media-facade.interface";
import { DISCOVERY_CONSTANTS } from "../../domain/constants/discovery.constants";

interface CandidatePhoto {
    url?: string;
    isPrimary?: boolean;
}

export class DiscoveryRecommendationMapper {
    public static async toRecommendationDto(
        candidate: DiscoveryCandidateRaw,
        userContext: DiscoveryUserContext,
        mediaFacade: IMediaFacade
    ): Promise<DiscoveryRecommendationDto> {
        // 1. Great-circle distance calculation
        const distanceKm = GeoUtil.calculateHaversineDistanceKm(
            userContext.location.coordinates[0], userContext.location.coordinates[1],
            candidate.location.coordinates[0], candidate.location.coordinates[1]
        );

        // 2. Safe and precise age calculation from verified date of birth
        const rawDob = candidate.kycVerification?.verifiedDOB as string | Date | undefined;
        const age = DateUtil.calculateAge(rawDob);

        // 3. Primary photo extraction and signed S3 URL resolution
        const photos = (candidate.photos as CandidatePhoto[]) || [];
        const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
        const primaryPhotoUrl = primaryPhoto?.url
            ? await mediaFacade.getPresignedMediaUrl(primaryPhoto.url, DISCOVERY_CONSTANTS.MEDIA_PRESIGNED_URL_TTL_SECONDS)
            : null;

        // 4. Cosine similarity score formatted as percentage
        const rawMatchScore = candidate.matchScore ?? 0;
        const matchScore = Number((rawMatchScore * DISCOVERY_CONSTANTS.SCORE_PERCENTAGE_MULTIPLIER).toFixed(1));

        return {
            id: String(candidate._id),
            displayName: (candidate.profile?.displayName as string) || 'Unknown',
            customLabel: candidate.profile?.customLabel as string | undefined,
            bio: (candidate.profile?.bio as string) || '',
            age,
            city: (candidate.profile?.city as string) || 'Unknown',
            state: (candidate.profile?.state as string) || 'Unknown',
            country: (candidate.profile?.country as string) || 'Unknown',
            distanceKm,
            matchScore,
            primaryPhotoUrl,
        };
    }
}
