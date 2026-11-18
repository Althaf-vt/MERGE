import { DiscoveryCandidateRaw, DiscoveryUserContext } from "../../domain/interfaces/discovery-repository.interface";
import { DiscoveryRecommendationDto, PaginatedRecommendationsDto } from "../dtos/discovery.dto";
import { GeoUtil } from "../../../../shared/domain/utils/geo.util";
import { DateUtil } from "../../../../shared/domain/utils/date.util";
import { IMediaFacade } from "../../../users/application/interfaces/media-facade.interface";
import { DISCOVERY_CONSTANTS } from "../../domain/constants/discovery.constants";

export class DiscoveryRecommendationMapper {
    public static async toRecommendationDto(
        candidate: DiscoveryCandidateRaw,
        userContext: DiscoveryUserContext,
        mediaFacade: IMediaFacade
    ): Promise<DiscoveryRecommendationDto> {
        // 1. Great-circle distance calculation
        const distanceKm = (userContext.location?.coordinates && candidate.location?.coordinates)
            ? GeoUtil.calculateHaversineDistanceKm(
                userContext.location.coordinates[0], userContext.location.coordinates[1],
                candidate.location.coordinates[0], candidate.location.coordinates[1]
            )
            : 0;

        // 2. Safe and precise age calculation from verified date of birth
        const rawDob = candidate.kycVerification?.verifiedDOB;
        const age = DateUtil.calculateAge(rawDob);

        // 3. Primary photo extraction and signed S3 URL resolution
        const photos = candidate.photos || [];
        const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
        const primaryPhotoUrl = primaryPhoto?.url
            ? await mediaFacade.getPresignedMediaUrl(primaryPhoto.url, DISCOVERY_CONSTANTS.MEDIA_PRESIGNED_URL_TTL_SECONDS)
            : null;

        // 4. Cosine similarity score formatted as percentage
        const rawMatchScore = candidate.matchScore ?? 0;
        const matchScore = Number((rawMatchScore * DISCOVERY_CONSTANTS.SCORE_PERCENTAGE_MULTIPLIER).toFixed(1));

        return {
            id: String(candidate._id),
            displayName: candidate.profile?.displayName || 'Unknown',
            customLabel: candidate.profile?.customLabel,
            bio: candidate.profile?.bio || '',
            age,
            city: candidate.profile?.city || 'Unknown',
            state: candidate.profile?.state || 'Unknown',
            country: candidate.profile?.country || 'Unknown',
            distanceKm,
            matchScore,
            primaryPhotoUrl,
        };
    }

    public static async toRecommendationDtoList(
        candidates: DiscoveryCandidateRaw[],
        userContext: DiscoveryUserContext,
        mediaFacade: IMediaFacade,
    ): Promise<DiscoveryRecommendationDto[]> {
        return Promise.all(
            candidates.map((candidate) =>
                DiscoveryRecommendationMapper.toRecommendationDto(candidate, userContext, mediaFacade),
            ),
        );
    }

    public static async toPaginatedResponseDto(
        candidates: DiscoveryCandidateRaw[],
        page: number,
        limit: number,
        userContext: DiscoveryUserContext,
        mediaFacade: IMediaFacade,
    ): Promise<PaginatedRecommendationsDto> {
        const data = await DiscoveryRecommendationMapper.toRecommendationDtoList(candidates, userContext, mediaFacade);
        return {
            data,
            total: data.length, // Vector search post-filtered count
            page,
            limit,
        };
    }
}
